import express from "express";
import {
  fetchWorkouts,
  assignUserWorkouts,
  completeWorkout,
  removeWorkout,
} from "../controller/workoutController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

router.get("/", authenticate, fetchWorkouts);
router.post("/", authenticate, assignUserWorkouts);
router.put("/:id/done", authenticate, completeWorkout);
router.delete("/:id", authenticate, removeWorkout);

export default router;
