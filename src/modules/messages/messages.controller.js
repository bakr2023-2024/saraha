import express from "express";
import {
  deleteMessage,
  getMessageById,
  getMessages,
  sendMessage,
} from "./messages.services.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import confirmEmailMiddleware from "../../middleware/confirmEmail.middleware.js";
const router = express.Router();
router.use(authMiddleware);
router.use(confirmEmailMiddleware);
router.get("/all/:userId", getMessages);
router.get("/:messageId", getMessageById);
router.post("/", sendMessage);
router.delete("/:messageId", deleteMessage);
export default router;
