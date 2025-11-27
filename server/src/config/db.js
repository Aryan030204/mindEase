import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Required for strict query warnings
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, // prevent performance issues in production
      connectTimeoutMS: 30000, // 30 seconds timeout
      serverSelectionTimeoutMS: 30000, // 30 seconds to select server
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Don't throw - let server start and retry in background
    console.log("Server will continue but database operations may fail");
    return null;
  }
};

// Graceful shutdown for production
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (SIGINT)");
  process.exit(0);
});

export default connectDB;
