import mongoose from "mongoose";
import slugify from "slugify";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["User", "Admin"],
      default: "User",
    },
    userName: {
      type: String,
      required: [true, "Name is required for comment"],
      trim: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const communityPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Post description is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Post body content is required"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    galleryImages: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Announcement", "Event Recap", "Achievement", "Member Spotlight", "Sponsor Update"],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      default: "Otter Society Admin",
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
    comments: [commentSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique slug prior to validation
communityPostSchema.pre("validate", async function () {
  if (this.title && !this.slug) {
    let generatedSlug = slugify(this.title, { lower: true, strict: true });
    
    // Ensure slug uniqueness
    const Post = mongoose.model("CommunityPost");
    let slugExists = await Post.findOne({ slug: generatedSlug });
    let counter = 1;
    
    while (slugExists && slugExists._id.toString() !== this._id.toString()) {
      generatedSlug = `${slugify(this.title, { lower: true, strict: true })}-${counter}`;
      slugExists = await Post.findOne({ slug: generatedSlug });
      counter++;
    }
    
    this.slug = generatedSlug;
  }
});

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;
