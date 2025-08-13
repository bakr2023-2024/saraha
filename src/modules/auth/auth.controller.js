import express from "express";
import {
  generateAccessToken,
  login,
  logout,
  sendEmail,
  signup,
  updatePassword,
  verifyEmail,
} from "./auth.services.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import confirmEmailMiddleware from "../../middleware/confirmEmail.middleware.js";
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.post("/refresh-token", generateAccessToken);
router.post("/confirm-email/send", authMiddleware, sendEmail);
router.post("/confirm-email/verify", authMiddleware, verifyEmail);
router.post(
  "/update-password",
  authMiddleware,
  confirmEmailMiddleware,
  updatePassword
);
export default router;
