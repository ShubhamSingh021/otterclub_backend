import mongoose from "mongoose";

const aboutContentSchema = new mongoose.Schema(
  {
    sectionLabel: { type: String, trim: true, default: "" },
    heading: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    keyPoints: { type: [String], default: [] },
    mission: { type: String, trim: true, default: "" },
    vision: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("AboutContent", aboutContentSchema);
