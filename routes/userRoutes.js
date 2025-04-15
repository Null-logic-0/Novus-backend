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
  getMe,
  getOneUser,
  updateMe,
} from "../controllers/userControllers.js";

export const router = Router();

router.post("/signup", signup);
router.post("/login", login);

router.use(protect);

router.get("/me", getMe, getOneUser);
router.patch("/updateMyPassword", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.route("/").get(getAllUsers);
router.route("/:id").get(getOneUser);
