import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Config.js";

import Chat from "../models/ChatModel.js";
import Message from "../models/messageModel.js";
import catchAsync from "../utils/catchAsync.js";

const mimeToExt = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
};

const multerStorage = multerS3({
  s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const ext = mimeToExt[file.mimetype] || file.mimetype.split("/")[1];
    const fileName = `user-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, `media/user-profiles/${req.user.email}/chats/${fileName}`);
  },
});

const multerFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith("image");
  const isVideo = file.mimetype.startsWith("video");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new AppError("Only .jpg, .jpeg, .png, and .mp4 files are allowed.", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadMedia = upload.array("media", 5);

export const createChat = catchAsync(async (req, res, next) => {
  let { userIds, isGroupChat, name } = req.body;

  if (!userIds || userIds.length < 1) {
    return res.status(400).json({ message: "Users required" });
  }

  if (typeof userIds === "string") {
    userIds = [userIds];
  }

  const users = [...new Set([...userIds, req.user._id.toString()])];
  isGroupChat = isGroupChat === "true" || isGroupChat === true;

  if (!isGroupChat && users.length === 2) {
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: users, $size: 2 },
    });

    if (existingChat) {
      return res.status(200).json({
        result: "success",
        data: {
          chat: existingChat,
        },
      });
    }
  }

  const chatData = {
    users,
    isGroupChat,
  };

  if (isGroupChat) {
    chatData.name = name || "Group Chat";
    chatData.admin = req.user._id;
  }

  const newChat = await Chat.create(chatData);
  const populatedChat = await newChat.populate(
    "users",
    "fullName profileImage"
  );

  res.status(201).json({
    result: "success",
    data: {
      chat: populatedChat,
    },
  });
});

export const getUserChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({ users: req.user._id })
    .populate("users", "fullName profileImage")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  const modifiedChats = chats.map((chat) => {
    const otherUser = chat.users.find(
      (user) => user._id.toString() !== req.user._id.toString()
    );

    return {
      _id: chat._id,
      isGroupChat: chat.isGroupChat,
      otherUser,
      lastMessage: chat.lastMessage,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  });

  res.status(200).json({
    status: "success",
    result: modifiedChats.length,
    data: {
      chats: modifiedChats,
    },
  });
});

export const getSingleChat = catchAsync(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate(
    "users",
    "fullName profileImage"
  );

  if (!chat) {
    return res.status(404).json({
      status: "fail",
      message: "Chat not found",
    });
  }

  const otherUser = chat.users.find(
    (user) => user._id.toString() !== req.user._id.toString()
  );

  res.status(200).json({
    status: "success",
    data: {
      chat: {
        _id: chat._id,
        isGroupChat: chat.isGroupChat,
        otherUser,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    },
  });
});

export const sendMessage = catchAsync(async (req, res) => {
  const media = req.files?.map((file) => file.location || file.path);
  const { chatId, content } = req.body;
  if (!chatId || (!content && (!media || media.length === 0))) {
    return res.status(400).json({ message: "Invalid message data" });
  }

  const newMessage = await Message.create({
    sender: req.user._id,
    chat: chatId,
    content,
    media: media || [],
  });

  await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

  const fullMessage = await Message.findById(newMessage._id)
    .populate("sender", "fullName profileImage")
    .populate("chat");

  res.status(201).json({
    status: "success",
    data: {
      message: fullMessage,
    },
  });
});

export const getChatMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "fullName profileImage")
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    result: messages.length,
    data: {
      messages,
    },
  });
});

export const deleteChat = catchAsync(async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // Delete messages related to this chat
  await Message.deleteMany({ chat: chatId });

  // Delete the chat itself
  await Chat.findByIdAndDelete(chatId);

  res
    .status(200)
    .json({ status: "success", message: "Chat deleted successfully" });
});
