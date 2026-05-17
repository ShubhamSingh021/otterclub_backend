import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "./src/models/Registration.js";
import User from "./src/models/User.js";
import Event from "./src/models/Event.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const repairRegistrations = async () => {
  try {
    console.log("REPAIR: Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("REPAIR: Connected to database.");

    // 1. Find registrations with missing or null user
    const corrupted = await Registration.find({
      $or: [
        { user: { $exists: false } },
        { user: null }
      ]
    });
    console.log(`REPAIR: Found ${corrupted.length} registrations with missing/null user field.`);

    let repairedCount = 0;
    for (const reg of corrupted) {
      // Skip cleaning up records where event is null (they will be deleted anyway)
      if (!reg.event) continue;

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

    // 2. Clean up orphaned registrations where event is null/missing or the referenced event does not exist
    console.log("REPAIR: Checking for orphaned registrations where event is null or does not exist...");
    const allRegs = await Registration.find({});
    let deletedOrphanedCount = 0;
    for (const reg of allRegs) {
      if (!reg.event) {
        await Registration.findByIdAndDelete(reg._id);
        deletedOrphanedCount++;
        console.log(`REPAIR: Deleted registration ${reg._id} because event field is null/missing.`);
        continue;
      }
      
      const eventExists = await Event.findById(reg.event);
      if (!eventExists) {
        await Registration.findByIdAndDelete(reg._id);
        deletedOrphanedCount++;
        console.log(`REPAIR: Deleted registration ${reg._id} because referenced Event ${reg.event} does not exist in DB.`);
      }
    }
    console.log(`REPAIR: Cleaned up ${deletedOrphanedCount} orphaned registrations.`);

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
    console.log(`- Cleaned up ${deletedOrphanedCount} orphaned registrations.`);
    console.log(`- Updated ${updatedFieldsCount} registrations with missing fields.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("REPAIR_ERROR:", error);
    process.exit(1);
  }
};

repairRegistrations();
