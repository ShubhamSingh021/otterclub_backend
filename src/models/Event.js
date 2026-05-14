import mongoose from "mongoose";
import slugify from "slugify";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["football", "cricket", "badminton", "yoga", "trekking", "pickleball", "gokarting", "other"],
    },
    eventImage: {
      type: String, // Cloudinary URL
      required: [true, "Event main image is required"],
    },
    galleryImages: [String], // Array of Cloudinary URLs
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },
    startTime: {
      type: String, // e.g., "10:00 AM"
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String, // e.g., "12:00 PM"
      required: [true, "End time is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    maxParticipants: {
      type: Number,
      required: [true, "Max participants is required"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    eventFee: {
      type: Number,
      required: [true, "Event fee is required"],
      default: 0,
    },
    membershipDiscount: {
      type: Number,
      default: 0,
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all levels"],
      default: "all levels",
    },
    ageRestriction: {
      type: String,
      default: "None",
    },
    healthDisclaimer: {
      type: String,
      default: "Participants should be in good health.",
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "cancelled"],
      default: "upcoming",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug before validation
eventSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
