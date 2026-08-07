import express from "express";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "../lib/inngest/index.js";

import workspaceRoutes from "../routes/workspaceRoutes.js";
import projectRoutes from "../routes/projectRoutes.js";
import taskRoutes from "../routes/taskRoutes.js";
import commentRoutes from "../routes/commentRoutes.js";

import { protect } from "../middlewares/authMiddleware.js";

import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Server is live!");
});

app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/workspaces", protect, workspaceRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/tasks", protect, taskRoutes);
app.use("/api/comments", protect, commentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
