import express from "express";
import {
  addComment,
  getTaskComments,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", addComment);
router.get("/:id", getTaskComments);

export default router;
