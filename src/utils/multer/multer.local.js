import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve("./src/config/.env.dev") });
export const FileTypesEnum = {
  IMAGE: ["image/jpeg", "image/jpg", "image/png"],
};
export const localFileUpload = ({
  customPath = "general",
  fileTypes = [],
} = {}) => {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const basePath = `uploads/${customPath}/${req.user._id}`;
      const fullPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
      file.newPath = `${basePath}`;
      callback(null, fullPath);
    },
    filename: (req, file, callback) => {
      const newFileName = `${Date.now()}_${Math.random()}_${file.originalname}`;
      file.newPath += `/${newFileName}`;
      callback(null, newFileName);
    },
  });

  const fileFilter = (req, file, callback) => {
    const isValid = fileTypes.includes(file.mimetype);
    return callback(
      isValid
        ? null
        : new Error(
            `Invalid file type, accepted formats: ${fileTypes
              .map((el) => el.split("/")[1])
              .join(", ")}`
          ),
      isValid
    );
  };

  return multer({
    dest: "./temp",
    fileFilter,
    storage,
    limits: {
      fileSize: Number(process.env.MAX_FILE_SIZE) * 1024 * 1024, // safer and clearer
    },
  });
};
