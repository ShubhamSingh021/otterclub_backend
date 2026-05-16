import mongoose from "mongoose";
import MembershipPlan from "../models/MembershipPlan.js";
import env from "../config/env.js";

const plans = [
  {
    name: "BASIC",
    price: 299,
    benefits: ["Access to regular events", "Community access", "Basic support"],
    displayOrder: 1,
    discountPercent: 0,
  },
  {
    name: "ELITE",
    price: 799,
    benefits: [
      "Everything in Basic",
      "Priority event registration",
      "10% discount on paid events",
      "Premium support",
      "Elite badge",
    ],
    displayOrder: 2,
    discountPercent: 10,
  },
  {
    name: "PRO",
    price: 1499,
    benefits: [
      "Everything in Elite",
      "20% event discount",
      "Exclusive members-only events",
      "Pro badge",
      "VIP support",
      "Early access booking",
    ],
    displayOrder: 3,
    discountPercent: 20,
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("Connected to MongoDB for seeding plans...");

    // Clear existing plans
    await MembershipPlan.deleteMany();
    console.log("Cleared existing membership plans.");

    // Insert new plans
    await MembershipPlan.insertMany(plans);
    console.log("Membership plans seeded successfully!");

    process.exit();
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();
