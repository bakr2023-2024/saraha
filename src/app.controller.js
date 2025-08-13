import express from "express";
import connectDB from "./db/db.connection.js";
import { globalErrorHandler } from "./utils/response.js";
import authRouter from "./modules/auth/auth.controller.js";
import messageRouter from "./modules/messages/messages.controller.js";
import userRouter from "./modules/users/users.controller.js";
import { startCronJob } from "./utils/security/cron.security.js";
import path from "node:path";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
const bootstrap = async () => {
  const PORT = process.env.PORT || 3000;
  await connectDB();
  const app = express();
  startCronJob();
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_COOLDOWN) * 60 * 1000,
    limit: Number(process.env.RATE_LIMIT_TRIES),
    message: `Too many requests, please try again after ${process.env.RATE_LIMIT_COOLDOWN} mins`,
  });
  app.use(express.json());
  app.use(morgan("common"));
  app.use(cors());
  app.use(helmet());
  app.use("/auth", limiter);
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/auth", authRouter);
  app.use("/messages", messageRouter);
  app.use("/users", userRouter);
  app.all("{/*dummy}", (req, res, next) =>
    next(new Error("Page not found", { cause: 404 }))
  );
  app.use(globalErrorHandler);
  app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
  });
};
export default bootstrap;
