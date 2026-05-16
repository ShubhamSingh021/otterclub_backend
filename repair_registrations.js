import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "./src/models/Registration.js";
import User from "./src/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const repairRegistrations = async () => {
  try {
    console.log("REPAIR: Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("REPAIR: Connected to database.");

    // 1. Find registrations with missing user
    const corrupted = await Registration.find({ user: { $exists: false } });
    console.log(`REPAIR: Found ${corrupted.length} registrations with missing user field.`);

    let repairedCount = 0;
    for (const reg of corrupted) {
      const user = await User.findOne({ email: reg.email.toLowerCase() });
      if (user) {
        reg.user = user._id;
        if (!reg.bookingId) {
          reg.bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }
        if (!reg.attendanceStatus) {
          reg.attendanceStatus = "pending";
        }
        await reg.save();
        repairedCount++;
        console.log(`REPAIR: Fixed registration ${reg._id} - Linked to user ${user.email}`);
      } else {
        console.warn(`REPAIR: Could not find user for registration ${reg._id} (email: ${reg.email})`);
      }
    }

    // 2. Ensure all have bookingId and attendanceStatus
    const missingFields = await Registration.find({ 
      $or: [
        { bookingId: { $exists: false } },
        { attendanceStatus: { $exists: false } }
      ]
    });
    console.log(`REPAIR: Found ${missingFields.length} registrations with missing bookingId or attendanceStatus.`);

    let updatedFieldsCount = 0;
    for (const reg of missingFields) {
      let updated = false;
      if (!reg.bookingId) {
        reg.bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        updated = true;
      }
      if (!reg.attendanceStatus) {
        reg.attendanceStatus = "pending";
        updated = true;
      }
      if (updated) {
        await reg.save();
        updatedFieldsCount++;
      }
    }

    console.log(`REPAIR COMPLETE:`);
    console.log(`- Linked ${repairedCount} registrations to users.`);
    console.log(`- Updated ${updatedFieldsCount} registrations with missing fields.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("REPAIR_ERROR:", error);
    process.exit(1);
  }
};

repairRegistrations();
