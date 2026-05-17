import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import User from "../models/User.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ email: "shivam06singh12314@gmail.com" });
    if (!user) {
      console.log("User not found.");
      return;
    }

    console.log("User found:", user._id, user.name, user.email);

    const registrations = await Registration.find({ user: user._id }).populate("event").lean();
    console.log("Registrations for user:", JSON.stringify(registrations, null, 2));

    const allEvents = await Event.find({}).lean();
    console.log("All Events in DB:", JSON.stringify(allEvents.map(e => ({ id: e._id, title: e.title, eventFee: e.eventFee })), null, 2));

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
