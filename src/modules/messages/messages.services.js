import {
  create,
  deleteById,
  find,
  findById,
  findOne,
} from "../../db/db.services.js";
import Message from "../../db/models/message.model.js";
import User from "../../db/models/user.model.js";
import { asyncHandler, successResponseHandler } from "../../utils/response.js";
/*
i assume logged in user can only see received messages of other users and not their sent messages, 
but the user can see his own sent and received messages
*/
export const getMessages = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (!(await findById({ model: User, id: userId })))
    return next(new Error("User not found", { cause: 404 }));
  const sentMessages =
    userId === req.user._id.toString()
      ? await find({
          model: Message,
          filter: { senderId: userId },
          select: "content receiverId",
          populate: [
            { path: "receiverId", select: "firstName lastName email gender" },
          ],
        })
      : "hidden";
  const receivedMessages = await find({
    model: Message,
    filter: { receiverId: userId },
    select: "content",
    populate:
      userId === req.user._id.toString()
        ? [
            {
              path: "receiverId",
              select: "firstName lastName email gender",
            },
          ]
        : [],
  });
  return successResponseHandler({
    res,
    data: { sentMessages, receivedMessages },
  });
});
export const getMessageById = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;
  const message = await findById({
    model: Message,
    id: messageId,
    select: "content",
    populate: [
      { path: "receiverId", select: "firstName lastName email gender" },
    ],
  });
  return successResponseHandler({
    res,
    data: { message },
  });
});
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { receiverId, content } = req.body;
  if (!content.length) return next(new Error("Content is required"));
  const message = await create({
    model: Message,
    data: [{ receiverId, content, senderId: req.user._id }],
  });
  return successResponseHandler({
    res,
    status: 201,
    message: "Message sent successfully",
    data: { message },
  });
});
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const messageId = req.params.messageId;
  const message = await findOne({
    model: Message,
    filter: { _id: messageId, senderId: req.user._id },
  });
  if (!message) return next(new Error("Message not found", { cause: 404 }));
  await deleteById({ model: Message, id: messageId });
  return successResponseHandler({
    res,
    message: "Message deleted successfully",
  });
});
/*
i assume messages can be found or created, but can neither be updated so no implementation of update
*/
