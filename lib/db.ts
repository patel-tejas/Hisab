import mongoose from "mongoose";

export const db = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection error:", error);
  }
};
