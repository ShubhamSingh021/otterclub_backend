import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    membershipType: {
      type: String,
      enum: ["BASIC", "ELITE", "PRO"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    membershipStatus: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    benefits: [String],
    upgradeHistory: [
      {
        from: String,
        to: String,
        date: { type: Date, default: Date.now },
        price: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for quick lookups
membershipSchema.index({ email: 1, membershipStatus: 1 });

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;
