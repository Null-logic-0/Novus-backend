export function registerPostHandlers(socket, io) {
  socket.on("new-post", (data) => {
    socket.broadcast.emit("new-post", data);
  });

  socket.on("edit-post", (data) => {
    socket.broadcast.emit("edit-post", data);
  });

  socket.on("delete-post", (postId) => {
    socket.broadcast.emit("delete-post", postId);
  });
}
