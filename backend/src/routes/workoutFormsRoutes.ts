import express from "express";
import {
  fetchWorkoutForms,
  addWorkoutForm,
  modifyWorkoutForm,
  removeWorkoutForm,
} from "../controller/workoutFormsController";
import { authenticate, isAdmin } from "../middleware/authenticate";
import  upload  from "../utils/multerConfig";

const router = express.Router();

router.get("/", authenticate, fetchWorkoutForms);
router.post("/", authenticate, isAdmin, upload.single("file"), addWorkoutForm);
router.put("/:id", authenticate, isAdmin, upload.single("file"), modifyWorkoutForm);
router.delete("/:id", authenticate, isAdmin, removeWorkoutForm);

export default router;
