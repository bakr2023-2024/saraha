import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("DB connected successfully");
  } catch (err) {
    console.error("DB connection failed", err.message);
  }
};
export default connectDB;
