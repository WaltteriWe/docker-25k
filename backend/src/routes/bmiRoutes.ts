import express from "express";
import {
  fetchAllBMI,
  fetchLatestBMI,
  addBMI,
  deleteBMIRecord,
} from "../controller/bmiController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

router.get("/", authenticate, fetchAllBMI);
router.get("/latest", authenticate, fetchLatestBMI);
router.post("/", authenticate, addBMI);
router.delete("/:id", authenticate, deleteBMIRecord);

export default router;
