import {
  create,
  deleteById,
  findOne,
  updateById,
  updateOne,
} from "../../db/db.services.js";
import User from "../../db/models/user.model.js";
import { compare, hash } from "../../utils/security/hash.security.js";
import { encrypt } from "../../utils/security/encryption.security.js";
import { asyncHandler, successResponseHandler } from "../../utils/response.js";
import { nanoid } from "nanoid";
import {
  generateToken,
  verifyToken,
} from "../../utils/security/token.security.js";
import { sendConfirmationEmail } from "../../utils/security/email.security.js";
import OTP from "../../db/models/otp.model.js";
import generateOTP from "../../utils/security/otp.security.js";
import Token from "../../db/models/token.model.js";
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone } = req.body;
  const existingUser = await findOne({ model: User, filter: { email } });
  if (existingUser)
    return next(new Error("Email already exists", { cause: 409 }));
  const hashedPassword = await hash({ originalText: password });
  const encryptedPhone = await encrypt({
    plainText: phone,
    secret: process.env.ENCRYPTION_KEY,
  });
  const [user] = await create({
    model: User,
    data: [
      {
        fullName,
        email,
        password: hashedPassword,
        gender,
        phone: encryptedPhone,
      },
    ],
  });
  return successResponseHandler({
    res,
    status: 201,
    message: "User created successfully",
    user,
  });
});
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await findOne({ model: User, filter: { email } });
  if (
    !existingUser ||
    !(await compare({
      originalText: password,
      hashedText: existingUser.password,
    }))
  )
    return next(new Error("Invalid email or password", { cause: 401 }));
  const jwtid = nanoid();
  const accessToken = await generateToken({
    payload: { userId: existingUser._id },
    secret: process.env.ACCESS_TOKEN_SECRET,
    options: { jwtid, expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
  });
  const refreshToken = await generateToken({
    payload: { userId: existingUser._id },
    secret: process.env.REFRESH_TOKEN_SECRET,
    options: { jwtid, expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
  });
  return successResponseHandler({
    res,
    status: 200,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
});
export const logout = asyncHandler(async (req, res, next) => {
  const { user, decoded } = req;
  const flag = req.body.flag || "";
  let status;
  if (flag == "all") {
    await updateById({
      model: User,
      id: user._id,
      data: { logoutTime: new Date() },
    });
    status = 200;
  } else {
    await create({
      model: Token,
      data: [
        {
          jti: decoded.jti,
          expiresIn:
            decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SEC),
          userId: user._id,
        },
      ],
    });
    status = 201;
  }
  return successResponseHandler({
    res,
    status,
    message: `Logged out ${status == 200 ? "from all" : ""} successfully`,
  });
});
export const generateAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshtoken } = req.headers;
  try {
    const decoded = await verifyToken({
      token: refreshtoken,
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    const accessToken = await generateToken({
      payload: { userId: decoded.userId },
      secret: process.env.ACCESS_TOKEN_SECRET,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
    });
    return successResponseHandler({
      res,
      message: "Your access token has expired, please use this new one",
      data: { accessToken },
    });
  } catch (err) {
    return next(
      new Error(
        err.name === "TokenExpiredError"
          ? "Refresh token expired, please log in"
          : "Invalid token",
        { cause: 401 }
      )
    );
  }
});
export const sendEmail = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const otp = await findOne({ model: OTP, filter: { userId } });
  if (otp && otp.cooldownUntil > Date.now()) {
    return next(
      new Error(
        `Please wait ${parseInt(
          (otp.cooldownUntil - Date.now()) / 1000
        )} seconds before requesting a new OTP`,
        {
          cause: 429,
        }
      )
    );
  }
  const code = generateOTP();
  await updateOne({
    model: OTP,
    filter: { userId },
    data: {
      code,
      userId,
      cooldownUntil: new Date(),
      expireAt: new Date(
        Date.now() + Number(process.env.OTP_EXPIRES_IN) * 60000
      ),
      tries: Number(process.env.OTP_TRIES),
    },
    options: { runValidators: true, upsert: true },
  });
  await sendConfirmationEmail({
    firstName: req.user.firstName,
    email: req.user.email,
    otp: code,
  });
  return successResponseHandler({
    res,
    status: 200,
    message: `an OTP has been sent to your inbox, it will expire in ${process.env.OTP_EXPIRES_IN} minutes`,
  });
});
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const userCode = req.body.userCode;
  let otp = await findOne({ model: OTP, filter: { userId: req.user._id } });
  if (!otp) {
    return next(
      new Error(
        "OTP not found or expired. Please request a new one at /auth/confirm-email/send",
        { cause: 404 }
      )
    );
  }
  if (otp.cooldownUntil > Date.now()) {
    const waitMinutes = Math.ceil((otp.cooldownUntil - Date.now()) / 60000);
    return next(
      new Error(
        `Too many incorrect attempts, please wait ${waitMinutes} more minutes`,
        { cause: 429 }
      )
    );
  }
  if (userCode !== otp.code) {
    if (otp.tries - 1 <= 0) {
      otp = await updateById({
        model: OTP,
        id: otp._id,
        data: {
          tries: 0,
          cooldownUntil: new Date(
            Date.now() + Number(process.env.OTP_COOLDOWN) * 60000
          ),
        },
      });
      return next(
        new Error(
          `Maximum tries reached, please wait ${process.env.OTP_COOLDOWN} minutes and request a new OTP at /auth/confirm-email/send`,
          { cause: 429 }
        )
      );
    } else {
      otp = await updateById({
        model: OTP,
        id: otp._id,
        data: {
          $inc: { tries: -1 },
        },
      });
      return next(
        new Error(
          `Invalid OTP (${otp.tries - 1} tries left), please try again`,
          {
            cause: 400,
          }
        )
      );
    }
  }
  await deleteById({ model: OTP, id: otp._id });
  const user = await updateById({
    model: User,
    id: req.user._id,
    data: { confirmEmail: new Date() },
  });
  return successResponseHandler({
    res,
    message: "Email confirmed successfully",
    data: { confirmEmail: user.confirmEmail },
  });
});
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (
    !(await compare({
      originalText: currentPassword,
      hashedText: req.user.password,
    }))
  )
    return next(new Error("Current password is incorrect", { cause: 400 }));
  if (currentPassword === newPassword)
    return next(
      new Error("New password must be different from old one", { cause: 400 })
    );
  const hashedPassword = await hash({ originalText: newPassword });
  const user = await updateById({
    model: User,
    id: req.user._id,
    data: { password: hashedPassword },
  });
  req.user = user;
  return successResponseHandler({
    res,
    message: "Password updated successfully",
  });
});
