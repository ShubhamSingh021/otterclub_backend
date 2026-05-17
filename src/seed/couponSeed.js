import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../models/Coupon.js";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";

dotenv.config();

const seedCoupons = async () => {
  try {
    await connectDatabase(env.mongoUri);

    console.log("Connected to MongoDB.");

    // Delete existing coupons with these codes to make it re-runnable without duplicates
    const couponCodes = ["WELCOME50", "OTTERFEST", "ELITEOTTER"];
    await Coupon.deleteMany({ code: { $in: couponCodes } });
    console.log("Cleared existing matching coupons (if any) to prevent duplicates.");

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year expiry

    const couponsData = [
      {
        code: "WELCOME50",
        description: "Get a massive 50% discount on any Otter Society event registration or membership upgrade!",
        discountType: "percentage",
        discountValue: 50,
        appliesTo: "both",
        usageLimit: 100,
        perUserLimit: 1,
        expiryDate: futureDate,
        isActive: true,
      },
      {
        code: "OTTERFEST",
        description: "Flat Rs. 250 off on our flagship community events and festival gatherings.",
        discountType: "fixed",
        discountValue: 250,
        appliesTo: "event",
        usageLimit: 200,
        perUserLimit: 2,
        expiryDate: futureDate,
        isActive: true,
      },
      {
        code: "ELITEOTTER",
        description: "Premium discount of 20% dedicated exclusively for Otter Society memberships.",
        discountType: "percentage",
        discountValue: 20,
        appliesTo: "membership",
        usageLimit: 50,
        perUserLimit: 1,
        expiryDate: futureDate,
        isActive: true,
      },
    ];

    await Coupon.create(couponsData);

    console.log("Successfully seeded 3 high-quality coupons: WELCOME50, OTTERFEST, ELITEOTTER.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding coupons:", error.message);
    process.exit(1);
  }
};

seedCoupons();
