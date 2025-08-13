import { verifyToken } from "../utils/security/token.security.js";
import { findById, findOne } from "../db/db.services.js";
import User from "../db/models/user.model.js";
import Token from "../db/models/token.model.js";
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer"))
    return next(new Error("Unauthorized", { cause: 401 }));
  const token = authorization.split(" ")[1];
  try {
    const decoded = await verifyToken({
      token,
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    if (
      decoded.jti &&
      (await findOne({ model: Token, filter: { jti: decoded.jti } }))
    )
      return next(new Error("Invalid login credentials", { cause: 401 }));
    const user = await findById({ model: User, id: decoded.userId });
    if (!user) return next(new Error("User not found", { cause: 404 }));
    if (user.logoutTime?.getTime() > decoded.iat * 1000)
      return next(new Error("Invalid login credentials", { cause: 401 }));
    req.user = user;
    req.decoded = decoded;
    return next();
  } catch (err) {
    console.log(err);
    return next(
      new Error(
        err.name === "TokenExpiredError"
          ? "Access token expired, please go to /auth/refresh-token to generate a new access token"
          : "Invalid token",
        { cause: 401 }
      )
    );
  }
};
export default authMiddleware;
