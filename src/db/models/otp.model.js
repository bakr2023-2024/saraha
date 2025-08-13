import * as mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    unique: true,
    index: true,
  },
  code: {
    type: String,
    length: Number(process.env.OTP_LENGTH),
    required: true,
  },
  tries: Number,
  cooldownUntil: { type: Date, default: new Date() },
  expireAt: Date,
});
const OTP = mongoose.models?.OTP || mongoose.model("OTP", otpSchema);
export default OTP;
