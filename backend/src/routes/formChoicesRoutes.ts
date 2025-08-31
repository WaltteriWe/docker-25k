import express from "express";
import {
  fetchChoices,
  createChoice,
  removeChoice
} from "../controller/formChoicesController";
import { authenticate, isAdmin } from "../middleware/authenticate";

const router = express.Router();

router.get("/:questionId", authenticate, fetchChoices);
router.post("/:questionId", authenticate, isAdmin, createChoice);
router.delete("/:id", authenticate, isAdmin, removeChoice);

export default router;
