import { Request, Response } from "express";
import {
  getAllWorkoutForms,
  createWorkoutForm,
  updateWorkoutForm,
  deleteWorkoutForm,
} from "../model/workoutFormsModel";

// GET all workout forms
export const fetchWorkoutForms = async (req: Request, res: Response) => {
  try {
    const forms = await getAllWorkoutForms();
    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching workout forms:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST create new workout form
export const addWorkoutForm = async (req: Request, res: Response) => {
  try {
    const file = req.file ? req.file.filename : null;

    const workoutData = {
      ...req.body,
      photo: file?.match(/\.(jpg|jpeg|png|gif)$/) ? file : null,
      video: file?.match(/\.(mp4|avi|mkv)$/) ? file : null
    };
    const id = await createWorkoutForm(workoutData);
    res.status(201).json({ message: "Workout form created", id });
  } catch (error) {
    console.error("Error adding workout form:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PUT update existing workout form
export const modifyWorkoutForm = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const file = req.file ? req.file.filename : null;

    const workoutData = {
      ...req.body,
      photo: file?.match(/\.(jpg|jpeg|png|gif)$/) ? file : null,
      video: file?.match(/\.(mp4|avi|mkv)$/) ? file : null
    };

    await updateWorkoutForm(id, workoutData);
    res.status(200).json({ message: "Workout form updated" });
  } catch (error) {
    console.error("Error updating workout form:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE workout form
export const removeWorkoutForm = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await deleteWorkoutForm(id);
    res.status(200).json({ message: "Workout form deleted" });
  } catch (error) {
    console.error("Error deleting workout form:", error);
    res.status(500).json({ error: "Server error" });
  }
};
