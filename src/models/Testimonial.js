import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    // Original Fields (Required for backward compatibility)
    personName: { type: String, trim: true, default: "" },
    personRole: { type: String, trim: true, default: "" },
    quote: { type: String, trim: true, default: "" },
    avatarUrl: { type: String, trim: true, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isFeatured: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },

    // Extended Fields (For real user-generated review system)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    userName: { type: String, trim: true, default: "" },
    avatar: { type: String, trim: true, default: "" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null, index: true },
    eventName: { type: String, trim: true, default: "" },
    membershipType: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    review: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Pre-save hook for document creations (.create() and .save())
testimonialSchema.pre("save", function () {
  if (this.userId) {
    // User-submitted review
    if (this.userName) this.personName = this.userName;
    if (this.review) this.quote = this.review;
    if (this.avatar) this.avatarUrl = this.avatar;

    let roleParts = [];
    if (this.membershipType) {
      roleParts.push(`${this.membershipType} Member`);
    }
    if (this.eventName) {
      roleParts.push(`Attended ${this.eventName}`);
    }
    if (roleParts.length > 0) {
      this.personRole = roleParts.join(" | ");
    } else {
      this.personRole = "Member";
    }

    this.isFeatured = this.featured;
    this.isActive = this.status === "approved";
  } else {
    // Admin-created CMS testimonial
    if (this.personName) this.userName = this.personName;
    if (this.quote) this.review = this.quote;
    if (this.avatarUrl) this.avatar = this.avatarUrl;
    
    // Auto-approve CMS testimonials
    this.status = "approved";
    this.featured = this.isFeatured;
  }
});

// Pre-update hook for query methods (findOneAndUpdate, updateOne, etc.)
const syncHook = function () {
  const update = this.getUpdate();
  if (!update) return;

  // Handle nested updates or root updates
  const data = update.$set || update;

  // We check if it is a user review or admin CMS based on fields
  if (data.userId || data.userName || data.review) {
    if (data.userName) data.personName = data.userName;
    if (data.review) data.quote = data.review;
    if (data.avatar) data.avatarUrl = data.avatar;

    let roleParts = [];
    if (data.membershipType) {
      roleParts.push(`${data.membershipType} Member`);
    }
    if (data.eventName) {
      roleParts.push(`Attended ${data.eventName}`);
    }
    if (roleParts.length > 0) {
      data.personRole = roleParts.join(" | ");
    } else if (data.membershipType !== undefined || data.eventName !== undefined) {
      data.personRole = "Member";
    }

    if (data.featured !== undefined) data.isFeatured = data.featured;
    if (data.status !== undefined) data.isActive = data.status === "approved";
  } else {
    // Admin CMS updating original fields
    if (data.personName) data.userName = data.personName;
    if (data.quote) data.review = data.quote;
    if (data.avatarUrl) data.avatar = data.avatarUrl;
    if (data.isFeatured !== undefined) data.featured = data.isFeatured;
    if (data.isActive !== undefined) data.status = data.isActive ? "approved" : "pending";
  }
};

testimonialSchema.pre("findOneAndUpdate", syncHook);
testimonialSchema.pre("updateOne", syncHook);
testimonialSchema.pre("updateMany", syncHook);

export default mongoose.model("Testimonial", testimonialSchema);
