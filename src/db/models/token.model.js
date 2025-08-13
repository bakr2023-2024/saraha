import * as mongoose from "mongoose";
const tokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    expiresIn: { type: Number, required: true },
    userId: { type: mongoose.Schema.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);
const Token = mongoose.models?.Token || mongoose.model("Token", tokenSchema);
export default Token;
