import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import resourceRoutes from "./routes/resource.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Core middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MindEase API is running",
    timestamp: new Date().toISOString(),
  });
});

// API info route
app.get("/api", (req, res) => {
  res.status(200).json({
    name: "MindEase API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      user: "/api/user",
      mood: "/api/mood",
      recommendations: "/api/recommendations",
      chat: "/api/chat",
      resources: "/api/resources",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resources", resourceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Error handler
app.use(errorMiddleware);

export default app;
