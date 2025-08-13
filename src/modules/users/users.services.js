import { deleteById, find, findOne, updateById } from "../../db/db.services.js";
import User from "../../db/models/user.model.js";
import { asyncHandler, successResponseHandler } from "../../utils/response.js";
import { decrypt, encrypt } from "../../utils/security/encryption.security.js";
export const profile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  user.phone = await decrypt({
    cipherText: req.user.phone,
    secret: process.env.ENCRYPTION_SECRET,
  });
  return successResponseHandler({ res, data: { user } });
});
//i assume we can search for users with queries
export const getUsers = asyncHandler(async (req, res, next) => {
  const filter = req.query;
  const users = await find({
    model: User,
    filter,
    select: "firstName lastName email gender",
  });
  return successResponseHandler({ res, data: { users: users } });
});
export const getUser = asyncHandler(async (req, res, next) => {
  const filter = req.query;
  const user = await findOne({
    model: User,
    filter,
    select: "firstName lastName email gender",
  });
  return successResponseHandler({ res, data: { user } });
});
export const updateUser = asyncHandler(async (req, res, next) => {
  const newData = req.body;
  if ("password" in newData) delete newData["password"];
  if ("phone" in newData) {
    newData.phone = await encrypt({
      plainText: newData.phone,
      secret: process.env.ENCRYPTION_SECRET,
    });
  }
  const updatedUser = await updateById({
    model: User,
    id: req.user._id,
    data: newData,
  });
  return successResponseHandler({
    res,
    message: "User updated successfully",
    data: { user: updatedUser },
  });
});
export const deleteUser = asyncHandler(async (req, res, next) => {
  const deletedUser = await deleteById({ model: User, id: req.user._id });
  return successResponseHandler({
    res,
    message: "User deleted successfully",
    data: { user: deletedUser },
  });
});
export const setProfilePic = asyncHandler(async (req, res, next) => {
  const user = await updateById({
    model: User,
    id: req.user._id,
    data: { profilePic: req.file.newPath },
  });
  return successResponseHandler({
    res,
    message: "Profile pic uploaded successfully",
    data: { user },
  });
});
