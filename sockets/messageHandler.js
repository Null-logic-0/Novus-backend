export function registerMessageHandler(socket, io) {
  socket.on("new-message", (data) => {
    socket.broadcast.emit("new-message", data);
  });

  socket.on("new-chat", (data) => {
    socket.broadcast.emit("new-chat", data);
  });

  socket.on("delete-chat", ({ chatId, users }) => {
    console.log(`Chat deleted: ${chatId} by user(s): ${users}`);
    socket.broadcast.emit("delete-chat", { chatId, users });
  });
}
