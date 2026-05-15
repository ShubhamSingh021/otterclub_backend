import mongoose from "mongoose";

const statsContentSchema = new mongoose.Schema(
  {
    clubCount: { type: Number, default: 0 },
    stateCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StatsContent", statsContentSchema);
