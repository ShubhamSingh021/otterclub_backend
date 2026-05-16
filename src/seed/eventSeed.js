import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import Event from "../models/Event.js";
import Admin from "../models/Admin.js";

const seedEvents = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    const admin = await Admin.findOne({ email: "admin@example.com" });
    if (!admin) {
      throw new Error("Admin not found. Run seed:admin first.");
    }

    const events = [
      {
        title: "Sunday Football League",
        description: "Join our weekly amateur football match. All skill levels welcome!",
        category: "football",
        eventImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
        galleryImages: [
          "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800",
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"
        ],
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        startTime: "09:00 AM",
        endTime: "11:00 AM",
        venue: "Central Park Sports Ground",
        maxParticipants: 22,
        eventFee: 200,
        membershipDiscount: 50,
        skillLevel: "all levels",
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        isFeatured: true
      },
      {
        title: "Cricket Summer Cup",
        description: "Annual summer cricket tournament for corporate teams and individuals.",
        category: "cricket",
        eventImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800",
        galleryImages: [
          "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800"
        ],
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        startTime: "10:00 AM",
        endTime: "05:00 PM",
        venue: "City Cricket Stadium",
        maxParticipants: 50,
        eventFee: 500,
        membershipDiscount: 100,
        skillLevel: "intermediate",
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        isFeatured: false
      },
      {
        title: "Badminton Open Championship",
        description: "Competitive badminton tournament. Prizes for winners!",
        category: "badminton",
        eventImage: "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=800",
        galleryImages: [
          "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=800"
        ],
        eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        startTime: "11:00 AM",
        endTime: "03:00 PM",
        venue: "Indoor Sports Complex",
        maxParticipants: 32,
        eventFee: 300,
        membershipDiscount: 75,
        skillLevel: "advanced",
        registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        isFeatured: true
      }
    ];

    await Event.insertMany(events);
    console.log("3 events seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedEvents();
