import crypto from "node:crypto";
const generateOTP = (length = Number(process.env.OTP_LENGTH)) =>
  crypto.randomBytes(parseInt(length / 2)).toString("hex");
export default generateOTP;
