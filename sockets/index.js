import { registerMessageHandler } from "./messageHandler.js";
import { registerPostHandlers } from "./postHandler.js";

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    registerPostHandlers(socket, io);
    registerMessageHandler(socket, io);
    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", reason);
    });
  });
}
export default registerSocketHandlers;
