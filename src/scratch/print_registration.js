import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const reg = await Registration.findById("6a09883cb9983f45b0418b69")
      .populate("event")
      .populate("user")
      .lean();
    console.log("Registration Details:", JSON.stringify(reg, null, 2));

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
