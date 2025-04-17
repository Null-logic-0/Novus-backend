import { Router } from "express";
import {
  login,
  protect,
  restrictTo,
  signup,
  updatePassword,
} from "../controllers/authControllers.js";
import {
  deleteMe,
  getAllUsers,
  getBlockedUsers,
  getFollowersUsers,
  getFollowingUsers,
  getMe,
  getOneUser,
  searchConnections,
  toggleBlockUser,
  toggleFollow,
  updateMe,
  uploadUserPhoto,
} from "../controllers/userControllers.js";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.use(protect);

router.get("/me", getMe, getOneUser);
router.patch("/updateMyPassword", updatePassword);
router.patch("/updateMe", uploadUserPhoto, updateMe);
router.delete("/deleteMe", deleteMe);

// Route to get following users
router.get("/following", getFollowingUsers);

// Route to get followers of the current user
router.get("/followers", getFollowersUsers);

// Search-user
router.get("/search/connections", searchConnections);

// Get blocked users
router.get("/blocked-users", getBlockedUsers);

router.route("/").get(getAllUsers);
router.route("/:id").get(getOneUser);

// Follow-unfollow route
router.route("/follow/:id").patch(toggleFollow);

// Block/unblock
router.patch("/block/:id", toggleBlockUser);
