import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startCollectiveJobs } from "./services/collectiveJobs.service.js";
import { connectRedis } from "./services/redis.service.js";

const PORT = process.env.PORT || 5000;

// Connect to database first, then start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    const server = http.createServer(app);
    startCollectiveJobs();
    
    server.listen(PORT, () => {
      console.log(`MindEase backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
