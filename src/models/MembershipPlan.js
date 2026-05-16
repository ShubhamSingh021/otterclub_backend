import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: 0,
    },
    benefits: [
      {
        type: String,
        required: true,
      },
    ],
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
    validityDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MembershipPlan", membershipPlanSchema);
