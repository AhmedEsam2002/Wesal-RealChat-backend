import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDb from "./utils/db.js";
import initSocket from "./sockets/socket.js";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.clear();
    await connectDb();

    const server = http.createServer(app);

    // ⬇️ تهيئة Socket.IO
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    app.set("io", io);

    initSocket(io);

    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 Visit:`);
      console.log(`- http://localhost:${PORT}`);
      console.log(`- http://127.0.0.1:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error(`❌ Failed to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

start();
