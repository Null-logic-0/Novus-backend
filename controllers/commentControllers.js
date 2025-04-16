import Comment from "../models/commentModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { toggleLike } from "../utils/toggleLike.js";

function buildCommentTree(comments, parentId = null, depth = 0) {
  const tree = [];

  comments
    .filter((comment) => String(comment.parentComment) === String(parentId))
    .forEach((comment) => {
      const children = buildCommentTree(comments, comment._id, depth + 1);
      tree.push({ ...comment, depth, replies: children });
    });

  return tree;
}

export const getPostComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate("user", "fullName profileImage")
    .lean(); // now you're working with plain JS objects

  const commentTree = buildCommentTree(comments); // recursive nesting

  res.status(200).json({
    status: "success",
    results: commentTree.length,
    data: {
      comments: commentTree,
    },
  });
});

export const createComment = catchAsync(async (req, res, next) => {
  let depth = 0;
  if (req.body.parentComment) {
    const parent = await Comment.findById(req.body.parentComment);
    if (!parent) {
      return next(new AppError("parent comment not found", 404));
    }
    depth = parent.depth + 1;
  }

  const newComment = await Comment.create({
    text: req.body.text,
    post: req.params.id,
    user: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: {
      comment: newComment,
    },
  });
});

export const commentReply = catchAsync(async (req, res, next) => {
  const newReply = await Comment.create({
    text: req.body.text,
    post: req.params.id,
    user: req.user.id,
    parentComment: req.params.parentCommentId,
    depth: req.body.depth,
  });

  res.status(201).json({
    status: "success",
    data: {
      comment: newReply,
    },
  });
});

export const updateComment = catchAsync(async (req, res, next) => {
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedComment) {
    return next(new AppError("Post not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      comment: updatedComment,
    },
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const deleted = await Comment.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return next(new AppError("Comment not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Likes
export const toggleLikeComment = toggleLike(Comment);
