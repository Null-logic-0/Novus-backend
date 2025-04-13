import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => "Database connected successfully")
  .catch(() => (error) => console.error(error.message, "DB conection failed!"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port:${port}`));
