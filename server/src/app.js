import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Security & Middleware setup
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(errorMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resource", resourceRoutes);

export default app;
