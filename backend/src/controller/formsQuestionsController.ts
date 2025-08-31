import { Request, Response } from "express";
import {
  getAllFormQuestions,
  createFormQuestion,
  updateFormQuestion,
  deleteFormQuestion
} from "../model/formsQuestionsModel";

// GET
export const fetchFormQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await getAllFormQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST
export const addFormQuestion = async (req: Request, res: Response) => {
  try {
    const { category, question } = req.body;
    const id = await createFormQuestion(category, question);
    res.status(201).json({ message: "Question created", id });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT
export const editFormQuestion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { category, question } = req.body;
    await updateFormQuestion(id, category, question);
    res.status(200).json({ message: "Question updated" });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const removeFormQuestion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await deleteFormQuestion(id);
    res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Server error" });
  }
};
