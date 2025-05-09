import { Server } from "socket.io";
import { createServer } from "node:http";
import mongoose from "mongoose";

import app from "./app.js";
import registerSocketHandlers from "./sockets/index.js";

const server = createServer(app);

const allowedOrigins = [
  "https://novus-three.vercel.app",
  "novus-git-main-null-logic-0s-projects.vercel.app",
  "novus-hn1gxqh7l-null-logic-0s-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  },
});
app.set("io", io);

const DB = process.env.DATABASE;
const port = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHR EXCEPTION! shutting down...");
  console.log(err.name, err.message);

  process.exit(1);
});

mongoose
  .connect(DB)
  .then(() => console.log("Database conected successfully"))
  .then(() => registerSocketHandlers(io))
  .catch((error) => console.error(error.message, "DB conection failed!"));

server.listen(port, () => console.log(`Server is running on port:${port}`));

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION! shutting down...");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
