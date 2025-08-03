import jwt from "jsonwebtoken";
import { setOnlineStatus } from "../controllers/userController.js";

const connectedUsers = new Map();

export default function initSocket(io) {
  // التحقق من JWT قبل الاتصال
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;

      next();
    } catch (err) {
      return next(new Error("Unauthorized socket"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user?.id;
    if (!userId) return socket.disconnect(true);

    // تأكد من أن userId هو string
    const userIdStr = userId.toString();
    connectedUsers.set(userIdStr, socket.id);
    await setOnlineStatus(userId, true);
    socket.emit("onlineUsers", { users: Array.from(connectedUsers.keys()) });

    io.emit("userOnline", { userId: userIdStr });

    console.log(`✅ User ${userIdStr} connected via socket: ${socket.id}`);

    // استقبال أحداث الرسائل للإشعارات فقط (الإرسال يتم عبر API)
    socket.on("joinRoom", ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`👥 User ${userIdStr} joined room: ${conversationId}`);
    });

    socket.on("leaveRoom", ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`👋 User ${userIdStr} left room: ${conversationId}`);
    });

    // إشعار بأن المستخدم يكتب - استخدام الغرف فقط
    socket.on("typing", ({ receiverId, conversationId }) => {
      if (conversationId) {
        // إرسال للغرفة المحددة (باستثناء المرسل)
        socket.to(conversationId).emit("userTyping", { userId: userIdStr });
        console.log(
          `✍️ User ${userIdStr} is typing in room: ${conversationId}`
        );
      }
    });

    // إشعار بأن المستخدم توقف عن الكتابة - استخدام الغرف فقط
    socket.on("stopTyping", ({ receiverId, conversationId }) => {
      if (conversationId) {
        // إرسال للغرفة المحددة (باستثناء المرسل)
        socket
          .to(conversationId)
          .emit("userStoppedTyping", { userId: userIdStr });
        console.log(
          `🛑 User ${userIdStr} stopped typing in room: ${conversationId}`
        );
      }
    });

    // طلب قائمة المستخدمين المتصلين
    socket.on("requestOnlineUsers", () => {
      const onlineUserIds = Array.from(connectedUsers.keys());
      socket.emit("onlineUsers", { users: onlineUserIds });
    });

    // انتظار استلام الرسالة (تأكيد القراءة) - مُحسّن
    socket.on("messageReceived", ({ messageId, conversationId }) => {
      console.log(`✅ Message ${messageId} received by user ${userIdStr}`);

      // إرسال تأكيد للغرفة أن الرسالة تم استلامها
      if (conversationId) {
        socket.to(conversationId).emit("messageDelivered", {
          messageId,
          receivedBy: userIdStr,
        });
      }
    });

    // الانفصال
    socket.on("disconnect", async () => {
      connectedUsers.delete(userIdStr);
      await setOnlineStatus(userId, false);
      io.emit("userOffline", { userId: userIdStr });
      console.log(`❌ User ${userIdStr} disconnected`);
    });
  });

  // جعل connectedUsers متاحة عالمياً للاستخدام في message controller
  global.connectedUsers = connectedUsers;
}
