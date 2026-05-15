import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
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
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    registrationStatus: {
      type: String,
      enum: ["registered", "approved", "cancelled"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registration for same email + event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

const Registration = mongoose.model("Registration", registrationSchema);

export default Registration;
