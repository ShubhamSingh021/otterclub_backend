import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Payment from "../models/Payment.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const payment = await Payment.findById("6a098824b9983f45b0418b68").lean();
    console.log("Payment Details:", JSON.stringify(payment, null, 2));

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
