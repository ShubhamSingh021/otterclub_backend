import mongoose from "mongoose";

const statsContentSchema = new mongoose.Schema(
  {
    clubCount: { type: Number, default: 0 },
    stateCount: { type: Number, default: 0 },
    stat1Label: { type: String, default: "Athletes & Members" },
    stat1Value: { type: String, default: "2,500+" },
    stat2Label: { type: String, default: "Coaching Sessions / Month" },
    stat2Value: { type: String, default: "320+" },
    stat3Label: { type: String, default: "Active Programs" },
    stat3Value: { type: String, default: "18" },
    stat4Label: { type: String, default: "Weekly Community Events" },
    stat4Value: { type: String, default: "12" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StatsContent", statsContentSchema);
