import { Request, Response } from "express";
import {
  getAllBMI,
  getLatestBMI,
  createBMIRecord,
  deleteBMI,
} from "../model/bmiModel";

// GET all BMI entries
export const fetchAllBMI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const entries = await getAllBMI(userId);
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching BMI:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET latest BMI only
export const fetchLatestBMI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const latest = await getLatestBMI(userId);
    res.status(200).json(latest);
  } catch (error) {
    console.error("Error fetching latest BMI:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST create BMI (Frontend does calculation, backend just stores)
export const addBMI = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { weight, height } = req.body;
    await createBMIRecord(userId, weight, height);
    res.status(201).json({ message: "BMI record created successfully" });
  } catch (error) {
    console.error("Error adding BMI:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE
export const deleteBMIRecord = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bmiId = parseInt(req.params.id);
    await deleteBMI(bmiId, userId);
    res.status(200).json({ message: "BMI entry deleted" });
  } catch (error) {
    console.error("Error deleting BMI:", error);
    res.status(500).json({ error: "Server error" });
  }
};
