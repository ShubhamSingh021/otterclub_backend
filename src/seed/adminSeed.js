import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDatabase(env.mongoUri);

    const adminEmail = "admin@example.com";
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (adminExists) {
      console.log("Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    const adminData = {
      name: "Super Admin",
      email: adminEmail,
      password: "adminpassword123", // Will be hashed by model pre-save hook
      role: "superadmin",
    };

    await Admin.create(adminData);

    console.log("Super Admin user created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
