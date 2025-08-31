import express from "express";
import {
  fetchFormQuestions,
  addFormQuestion,
  editFormQuestion,
  removeFormQuestion,
} from "../controller/formsQuestionsController";

import {
  fetchQuestions,
  fetchFormChoices,
  saveUserAnswers,
} from "../controller/answersController"; // Import from correct controller

import { authenticate, isAdmin } from "../middleware/authenticate";

const router = express.Router();

// Form question management routes
router.get("/", authenticate, fetchFormQuestions);
router.post("/", authenticate, isAdmin, addFormQuestion);
router.put("/:id", authenticate, isAdmin, editFormQuestion);
router.delete("/:id", authenticate, isAdmin, removeFormQuestion);

// Form answers routes
router.get("/forms-questions", authenticate, fetchQuestions);
router.get("/forms-answers/choices", authenticate, fetchFormChoices);
router.post("/forms-answers/user-answers", authenticate, saveUserAnswers);

export default router;
