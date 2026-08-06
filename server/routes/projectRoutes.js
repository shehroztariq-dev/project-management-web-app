import express from "express";
import {
  addMember,
  createProject,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", createProject);
router.put("/", updateProject);
router.post("/:projectId/addMember", addMember);

export default router;
