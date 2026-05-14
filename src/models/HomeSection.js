import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    meta: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    ctaLabel: { type: String, trim: true, default: "" },
    ctaHref: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const homeSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ["whyJoinUs", "eventsPreview", "testimonials", "contactCta"],
      required: true,
      index: true,
    },
    sectionLabel: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
    cards: { type: [cardSchema], default: [] },
    ctaLabel: { type: String, trim: true, default: "" },
    ctaHref: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("HomeSection", homeSectionSchema);
