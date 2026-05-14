import mongoose from "mongoose";

const heroCtaSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    href: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const heroStatSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const heroContentSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true, default: "" },
    backgroundImageUrl: { type: String, trim: true, default: "" },
    primaryCta: heroCtaSchema,
    secondaryCta: heroCtaSchema,
    stats: { type: [heroStatSchema], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("HeroContent", heroContentSchema);
