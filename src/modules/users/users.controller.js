import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import confirmEmailMiddleware from "../../middleware/confirmEmail.middleware.js";
import {
  getUser,
  updateUser,
  deleteUser,
  profile,
  getUsers,
  setProfilePic,
} from "./users.services.js";
import {
  localFileUpload,
  FileTypesEnum,
} from "../../utils/multer/multer.local.js";
const router = express.Router();
router.use(authMiddleware);
router.use(confirmEmailMiddleware);
router.get("/profile", profile);
router.get("/search-one", getUser);
router.get("/search-many", getUsers);
router.patch("/profile", updateUser);
router.delete("/profile", deleteUser);
router.patch(
  "/profile-pic",
  localFileUpload({
    customPath: "users",
    fileTypes: FileTypesEnum.IMAGE,
  }).single("image"),
  setProfilePic
);
export default router;
