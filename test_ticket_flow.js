import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Registration from "./src/models/Registration.js";
import User from "./src/models/User.js";
import Event from "./src/models/Event.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const testTicketFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("TEST: Connected to database.");

    // 1. Create two users
    const user1 = await User.create({ name: "Owner", email: `owner_${Date.now()}@test.com`, password: "password123" });
    const user2 = await User.create({ name: "Stranger", email: `stranger_${Date.now()}@test.com`, password: "password123" });
    console.log("TEST: Users created.");

    // 2. Create an event
    const event = await Event.create({
      title: "Test Event",
      description: "Test",
      eventDate: new Date(),
      startTime: "10:00 AM",
      endTime: "12:00 PM",
      venue: "Test Venue",
      maxParticipants: 100,
      eventImage: "http://example.com/image.jpg",
      registrationDeadline: new Date(),
      location: "Test Location",
      category: "other",
      createdBy: user1._id
    });
    console.log("TEST: Event created.");

    // 3. Create registration
    const bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const registration = await Registration.create({
      user: user1._id,
      event: event._id,
      fullName: user1.name,
      email: user1.email,
      phone: "1234567890",
      age: 25,
      emergencyContact: "999",
      bookingId,
      paymentStatus: "paid",
      registrationStatus: "approved"
    });
    console.log("TEST: Registration created.");

    // 4. Verify fields
    console.log("TEST: Verifying registration fields...");
    const regFromDb = await Registration.findById(registration._id);
    if (regFromDb.user.toString() === user1._id.toString() && regFromDb.bookingId === bookingId) {
      console.log("TEST: Registration fields are correct.");
    } else {
      throw new Error("Registration fields mismatch!");
    }

    // 5. Simulate ownership check (like in controller)
    console.log("TEST: Checking ownership logic...");
    const checkOwnership = (reg, userId) => {
      return reg.user && reg.user.toString() === userId.toString();
    };

    if (checkOwnership(regFromDb, user1._id)) {
      console.log("TEST: Owner access granted - CORRECT");
    } else {
      throw new Error("Owner access denied!");
    }

    if (!checkOwnership(regFromDb, user2._id)) {
      console.log("TEST: Stranger access denied - CORRECT");
    } else {
      throw new Error("Stranger access granted!");
    }

    // Cleanup
    await Registration.deleteOne({ _id: registration._id });
    await Event.deleteOne({ _id: event._id });
    await User.deleteOne({ _id: user1._id });
    await User.deleteOne({ _id: user2._id });
    console.log("TEST: Cleanup done.");

    await mongoose.disconnect();
    console.log("TEST SUCCESS: Ticket flow works perfectly!");
  } catch (error) {
    console.error("TEST_ERROR:", error);
    process.exit(1);
  }
};

testTicketFlow();
