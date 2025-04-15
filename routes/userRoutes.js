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
  updateMe,
} from "../controllers/userControllers.js";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.route("/").get(getAllUsers);
