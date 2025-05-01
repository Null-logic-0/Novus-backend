import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Config.js";

import Post from "../models/postModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { toggleLike } from "../utils/toggleLike.js";
import User from "../models/userModel.js";

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
    cb(null, `media/user-profiles/${req.user.email}/posts/${fileName}`);
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
  // limits: {
  //   fileSize: 150 * 1024 * 1024,
  // },
});

export const uploadMedia = upload.array("media", 5);

export const currentLoggedinUser = async (req, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (post.user._id.toString() !== req.user.id)
    return next(new AppError("You are not allowed to do this action", 403));

  return post;
};

// export const getAllPosts = catchAsync(async (req, res, next) => {
//   const posts = await Post.find().sort({ createdAt: -1 });
//   res.status(200).json({
//     status: "success",
//     results: posts.length,
//     data: {
//       posts,
//     },
//   });
// });

export const getAllPosts = catchAsync(async (req, res, next) => {
  const { filter } = req.query;
  const userId = req.user.id;

  let filterQuery = {};

  if (filter === "likes") {
    filterQuery = { likes: { $elemMatch: { $in: [[userId]] } } };
  }

  if (filter === "followings") {
    const user = await User.findById(userId).select("following");
    filterQuery = { user: { $in: user.following } };
  }

  const posts = await Post.find(filterQuery)
    .sort({ createdAt: -1 })
    .populate("user", "fullName profileImage");
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

export const getSinglePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("No post found with this ID."));
  }

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

export const createPost = catchAsync(async (req, res, next) => {
  const media = req.files?.map((file) => file.location || file.path);

  const newPost = await Post.create({ ...req.body, user: req.user.id, media });

  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  await currentLoggedinUser(req, next);

  const media = req.files?.map((file) => file.location || file.path);
  const updateData = {
    ...req.body,
  };

  if (media?.length > 0) {
    updateData.media = media;
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedPost) {
    return next(new AppError("Post not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      post: updatedPost,
    },
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  await currentLoggedinUser(req, next);
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Post like
export const togglePostLike = toggleLike(Post);
