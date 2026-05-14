import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, required: true },
    href: { type: String, trim: true, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, trim: true, required: true },
    siteTagline: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    navigationLinks: { type: [linkSchema], default: [] },
    socialLinks: { type: [linkSchema], default: [] },
    contact: {
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      whatsapp: { type: String, trim: true, default: "" },
      address: { type: String, trim: true, default: "" },
      mapUrl: { type: String, trim: true, default: "" },
    },
    globalCta: {
      label: { type: String, trim: true, default: "" },
      href: { type: String, trim: true, default: "" },
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
