import Post from "../models/postModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const currentLoggedInUser = async (req, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  if (post.user._id.toString() !== req.user.id)
    return next(new AppError("You are not allowed to do this action", 403));

  return post;
};

export const getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find();

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
  const newPost = await Post.create({ ...req.body, user: req.user.id });

  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  await currentLoggedInUser(req, next);

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
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
  await currentLoggedInUser(req, next);
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});
