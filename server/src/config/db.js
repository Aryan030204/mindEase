import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Required for strict query warnings
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false, // prevent performance issues in production
      connectTimeoutMS: 10000, // avoid hanging connections
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);

    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Graceful shutdown for production
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (SIGINT)");
  process.exit(0);
});

export default connectDB;
