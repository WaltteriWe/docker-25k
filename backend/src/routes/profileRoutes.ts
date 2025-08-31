import express from "express";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controller/profileController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

router.get("/", authenticate, getUserProfile);
router.post("/", authenticate, createUserProfile);
router.put("/", authenticate, updateUserProfile);
router.delete("/", authenticate, deleteUserProfile);

export default router;
