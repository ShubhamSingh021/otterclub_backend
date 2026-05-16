import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bookingId: {
      type: String,
      required: [true, "Booking ID is required"],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
    },
    previousParticipation: {
      type: Boolean,
      default: false,
    },
    healthCondition: {
      type: String,
      default: "None",
    },
    emergencyContact: {
      type: String,
      required: [true, "Emergency contact number is required"],
    },
    additionalNotes: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "completed"],
      default: "pending",
    },
    attendanceStatus: {
      type: String,
      enum: ["pending", "attended"],
      default: "pending",
    },
    registrationStatus: {
      type: String,
      enum: ["registered", "approved", "cancelled"],
      default: "registered",
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    membershipType: {
      type: String,
      default: "NONE",
    },
  },
  {
    timestamps: true,
  }
);

// Programmatic duplicate check is handled in registrationController.js
// to allow retries for interrupted payment sessions.

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
