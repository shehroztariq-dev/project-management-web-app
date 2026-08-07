import express from "express";
import {
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", createTask);
router.put("/:id", updateTask);
router.post("/delete", deleteTask);

export default router;
