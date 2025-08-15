import mongoose from "mongoose";
import "dotenv/config";
export const connect = async () => {
  try {
    await mongoose.connect(String(process.env.DATABASE_URL));
    console.log("Database has been conntected!")
  } catch (error) {
    console.log("Database has not been conntected!")
  }
}