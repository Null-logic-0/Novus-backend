import { Router } from "express";
import { protect } from "../controllers/authControllers.js";
import { getActivity } from "../controllers/activityControllers.js";

export const router = Router();

router.use(protect);

router.get("/", getActivity);
