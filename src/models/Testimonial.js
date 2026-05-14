import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    personName: { type: String, trim: true, required: true },
    personRole: { type: String, trim: true, default: "" },
    quote: { type: String, trim: true, required: true },
    avatarUrl: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isFeatured: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
