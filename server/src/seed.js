import mongoose from "mongoose";
import User from "./models/User.model.js";
import MoodLog from "./models/MoodLog.model.js";
import UserInsight from "./models/UserInsight.model.js";
import { hashPassword } from "./services/password.service.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const seed = async () => {
  try {
    // 1. Connect to DB
    await connectDB();
    console.log("Database connected for seeding.");

    const email = "insights@example.com";
    const password = "password123";

    // 2. Clean up existing test data of this user to avoid duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await MoodLog.deleteMany({ userId: existingUser._id });
      await UserInsight.deleteMany({ userId: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log("Cleaned up existing user and logs.");
    }

    // 3. Create User
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      firstName: "Test",
      lastName: "User Insights",
      email,
      password: hashedPassword,
      role: "user",
      preferences: { exercise: true, music: true, meditation: true },
    });

    console.log(`Created test user: ${email}`);
    const userId = user._id;

    // 4. Seeding Mood Logs (60 Days)
    const logs = [];
    const emotions = ["happy", "sad", "anxious", "calm", "neutral", "angry", "excited"];
    const now = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const day = date.getDay();

      let moodScore = 5;
      let emotionTag = "neutral";

      // Patterns creation logic
      if (day === 1) { // Monday (Low mood)
        moodScore = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
        emotionTag = "sad";
      } else if (day === 5 || day === 6) { // Friday / Saturday (High mood)
        moodScore = Math.floor(Math.random() * 4) + 7; // 7, 8, 9, 10
        emotionTag = "happy";
      } else {
        moodScore = Math.floor(Math.random() * 5) + 4; // 4, 5, 6, 7, 8
        emotionTag = emotions[Math.floor(Math.random() * emotions.length)];
      }

      const log = new MoodLog({
        userId,
        date,
        moodScore,
        emotionTag,
        notes: `Simulated entry for day index ${60 - i}`,
        activityDone: Math.random() > 0.4,
      });

      logs.push(log);
    }

    await MoodLog.insertMany(logs);
    console.log(`Successfully seeded ${logs.length} mood logs!`);

    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seed();
