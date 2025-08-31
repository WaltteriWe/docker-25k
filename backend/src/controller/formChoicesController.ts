import { Request, Response } from "express";
import {
  getChoicesByQuestionId,
  addChoice,
  deleteChoice
} from "../model/formChoicesModel";

// GET
export const fetchChoices = async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const choices = await getChoicesByQuestionId(questionId);
    res.status(200).json(choices);
  } catch (error) {
    console.error("Error fetching choices:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST
export const createChoice = async (req: Request, res: Response) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const { answer_text } = req.body;
    const id = await addChoice(questionId, answer_text);
    res.status(201).json({ message: "Choice added", id });
  } catch (error) {
    console.error("Error adding choice:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const removeChoice = async (req: Request, res: Response) => {
  try {
    const choiceId = parseInt(req.params.id);
    await deleteChoice(choiceId);
    res.status(200).json({ message: "Choice deleted" });
  } catch (error) {
    console.error("Error deleting choice:", error);
    res.status(500).json({ error: "Server error" });
  }
};
