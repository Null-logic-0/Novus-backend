import { Router } from "express";
import { protect } from "../controllers/authControllers.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  updatePost,
} from "../controllers/PostControllers.js";

export const router = Router();

router.use(protect);

router.route("/").get(getAllPosts).post(createPost);
router.route("/:id").get(getSinglePost).patch(updatePost).delete(deletePost);
