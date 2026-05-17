import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    const events = await Event.find({}).lean();
    console.log("All Events in DB:", JSON.stringify(events, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

run();
