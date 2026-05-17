import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB successfully.");

    const usersCount = await User.countDocuments({});
    const membershipsCount = await Membership.countDocuments({});
    const eventsCount = await Event.countDocuments({});

    console.log("Database Stats:");
    console.log("- Users Count:", usersCount);
    console.log("- Memberships Count:", membershipsCount);
    console.log("- Events Count:", eventsCount);

    const sampleUsers = await User.find({}).limit(5).populate("activeMembership").lean();
    console.log("Sample Users:", JSON.stringify(sampleUsers, null, 2));

    const sampleMemberships = await Membership.find({}).limit(5).lean();
    console.log("Sample Memberships:", JSON.stringify(sampleMemberships, null, 2));

  } catch (error) {
    console.error("Database check failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

run();
