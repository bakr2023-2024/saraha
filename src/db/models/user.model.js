import * as mongoose from "mongoose";
import { hash } from "../../utils/security/hash.security.js";
import { encrypt } from "../../utils/security/encryption.security.js";
const genders = { male: "male", female: "female" };
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genders),
        default: genders.male,
        message: `User has to be ${Object.values(genders)}`,
      },
    },
    phone: String,
    confirmEmail: { type: Date, default: null },
    logoutTime: Date,
    profilePic: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema
  .virtual("fullName")
  .set(function (val) {
    const [firstName, lastName] = val?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
