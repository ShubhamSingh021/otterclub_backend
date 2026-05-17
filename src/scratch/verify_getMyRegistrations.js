import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const userId = "6a0832bd425f65447451c6c4";
    console.log(`FETCHING REGISTRATIONS FOR USER ID: ${userId}...`);

    const registrations = await Registration.find({ user: userId })
      .populate("event")
      .sort("-createdAt");

    console.log(`Found ${registrations.length} registrations:`);
    registrations.forEach((reg, i) => {
      console.log(`\n[${i + 1}] Event Title: ${reg.event ? reg.event.title : "NULL"}`);
      console.log(`    Booking ID: ${reg.bookingId}`);
      console.log(`    Payment Status: ${reg.paymentStatus}`);
      console.log(`    Registration Status: ${reg.registrationStatus}`);
      console.log(`    Discounted Price: ${reg.discountedPrice}`);
      console.log(`    Membership Type: ${reg.membershipType}`);
    });

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
