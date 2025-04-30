import { Router } from "express";
import { protect } from "../controllers/authControllers.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getLikedPosts,
  getSinglePost,
  togglePostLike,
  updatePost,
  uploadMedia,
} from "../controllers/postControllers.js";
import {
  commentReply,
  createComment,
  deleteComment,
  getPostComments,
  getSingleComment,
  toggleLikeComment,
  updateComment,
} from "../controllers/commentControllers.js";

export const router = Router();

router.use(protect);
// Posts
router.route("/").get(getAllPosts).post(uploadMedia, createPost);

// Liked-posts
router.get("/liked-posts", getLikedPosts);

router
  .route("/:id")
  .get(getSinglePost)
  .patch(uploadMedia, updatePost)
  .delete(deletePost);

// Comments
router.route("/:id/comments").get(getPostComments).post(createComment);

// Comment reply nested route
router.route("/:id/comments/:parentCommentId/replies").post(commentReply);
router
  .route("/comments/:id")
  .get(getSingleComment)
  .patch(updateComment)
  .delete(deleteComment);

// Post like
router.route("/:id/like").patch(togglePostLike);

// Comment like
router.route("/comments/:id/like").patch(toggleLikeComment);
