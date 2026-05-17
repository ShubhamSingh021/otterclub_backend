import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Payment from "../models/Payment.js";
import Event from "../models/Event.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const payments = await Payment.find({})
      .sort("-createdAt")
      .limit(10)
      .populate("event")
      .lean();
      
    console.log("Recent Payments in DB:");
    console.log(JSON.stringify(payments.map(p => ({
      id: p._id,
      amount: p.amount,
      status: p.status,
      razorpayOrderId: p.razorpayOrderId,
      event: p.event?.title,
      email: p.paymentDetails?.registrationData?.email,
      fullName: p.paymentDetails?.registrationData?.fullName,
      createdAt: p.createdAt
    })), null, 2));

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
