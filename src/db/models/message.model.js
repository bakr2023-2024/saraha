import * as mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    senderId: { type: mongoose.Schema.ObjectId, ref: "User" },
    receiverId: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);
const Message =
  mongoose.models?.Message || mongoose.model("Message", messageSchema);
export default Message;
