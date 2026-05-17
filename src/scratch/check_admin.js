import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Admin from "../models/Admin.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    const admins = await Admin.find({});
    console.log("Admins in DB:", JSON.stringify(admins, null, 2));
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

run();
