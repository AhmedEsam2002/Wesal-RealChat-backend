import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Conversation from "../models/conversationModel.js";

export const getMyConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "name avatar")
    .populate("lastMessage")
    .sort("-updatedAt");

  res.status(200).json({
    status: "success",
    results: conversations.length,
    data: { conversations },
  });
});
export const getConversationWithUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
  })
    .populate("participants", "name avatar")
    .populate("lastMessage")
    .sort("-updatedAt");

  if (!conversation) {
    return next(new AppError("No conversation found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { conversation },
  });
});
