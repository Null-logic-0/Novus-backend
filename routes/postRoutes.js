import { Router } from "express";
import { protect } from "../controllers/authControllers.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  updatePost,
} from "../controllers/PostControllers.js";
import {
  commentReply,
  createComment,
  deleteComment,
  getPostComments,
  updateComment,
} from "../controllers/commentControllers.js";

export const router = Router();

router.use(protect);

// Posts
router.route("/").get(getAllPosts).post(createPost);
router.route("/:id").get(getSinglePost).patch(updatePost).delete(deletePost);

// Comments
router.route("/:id/comments").get(getPostComments).post(createComment);

// Comment reply nested route
router.route("/:id/comments/:parentCommentId/replies").post(commentReply);
router.route("/comments/:id").patch(updateComment).delete(deleteComment);
