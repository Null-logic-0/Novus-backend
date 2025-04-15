import mongoose from "mongoose";
import app from "./app.js";

const DB = process.env.DATABASE;

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHR EXCEPTION! shutting down...");
  console.log(err.name, err.message);

  process.exit(1);
});

mongoose
  .connect(DB)
  .then(() => console.log("Database conected successfully"))
  .catch((error) => console.error(error.message, "DB conection failed!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Server is running on port:${port}`)
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLER REJECTION! shutting down...");
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
