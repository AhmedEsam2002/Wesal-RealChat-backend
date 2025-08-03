import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import cloudinary from "../utils/cloudinary.js";
export const sendMessage = catchAsync(async (req, res, next) => {
  const { receiverId } = req.params;
  const { text, img } = req.body;
  if (!receiverId) {
    return next(new AppError("Receiver ID is required", 400));
  }

  //   Check if already in conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
  });

  // 2. If not exists, create it
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
    });
  }
  let img_url = null;
  if (img) {
    const result = await cloudinary.uploader.upload(img, {
      folder: "chat-app",
    });
    img_url = result.secure_url;
  }
  //   create a new message
  const newMessage = new Message({
    sender: req.user._id,
    receiver: receiverId,
    text,
    img: img_url,
  });
  await newMessage.save();

  // تحميل بيانات المرسل والمستقبل
  await newMessage.populate("sender", "name avatar email online");
  await newMessage.populate("receiver", "name avatar email online");

  // 🔄 4. Update conversation with lastMessage
  conversation.lastMessage = newMessage._id;
  await conversation.save();

  // 🔄 إرسال الرسالة عبر السوكتس إذا كان المستلم متصل
  const io = req.app.get("io");
  if (io && global.connectedUsers) {
    // إرسال للغرفة أولاً (للمستخدمين الموجودين في الغرفة)
    io.to(conversation._id.toString()).emit("newMessage", newMessage);

    // إرسال للمستلم مباشرة أيضاً (للتأكد من وصول الرسالة حتى لو لم يكن في الغرفة)
    const receiverSocketId = global.connectedUsers.get(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log(`📨 Message sent directly to receiver: ${receiverId}`);
    }

    // إرسال للمرسل للتأكيد
    const senderSocketId = global.connectedUsers.get(req.user._id.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSent", {
        messageId: newMessage._id,
        timestamp: newMessage.createdAt,
        message: newMessage,
        conversationId: conversation._id.toString(),
      });
    }
  }

  res.status(201).json({
    status: "success",
    data: {
      message: newMessage,
    },
  });
});
export const getMessage = catchAsync(async (req, res, next) => {
  const { receiverId } = req.params;
  if (!receiverId) {
    return next(new AppError("Receiver ID is required", 400));
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name avatar email online ")
    .populate("receiver", "name avatar email online");

  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});
