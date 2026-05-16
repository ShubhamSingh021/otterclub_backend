import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";

dotenv.config();

const addCustomAdmin = async () => {
  try {
    await connectDatabase(env.mongoUri);

    const email = "singhshubham21112003@gmail.com";
    const exists = await Admin.findOne({ email });

    if (exists) {
      console.log(`Admin with email ${email} already exists.`);
      process.exit(0);
    }

    const adminData = {
      name: "Shubham Singh",
      email: email,
      password: "adminpassword123", // You can change this later
      role: "superadmin",
    };

    await Admin.create(adminData);

    console.log(`Successfully added ${email} as Super Admin!`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding custom admin:", error.message);
    process.exit(1);
  }
};

addCustomAdmin();
