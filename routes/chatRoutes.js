import { Router } from "express";
import { protect } from "../controllers/authControllers.js";
import {
  createChat,
  deleteChat,
  getChatMessages,
  getSingleChat,
  getUserChats,
  sendMessage,
  uploadMedia,
} from "../controllers/chatControllers.js";

export const router = Router();

router.use(protect);

router.route("/").get(getUserChats).post(createChat);
router.get("/:id", getSingleChat);
router.post("/messages", uploadMedia, sendMessage);
router.get("/messages/:chatId", getChatMessages);
router.delete("/:chatId", deleteChat);
