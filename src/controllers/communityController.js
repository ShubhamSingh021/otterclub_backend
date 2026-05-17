import CommunityPost from "../models/CommunityPost.js";

// @desc    Create a new community post
// @route   POST /api/v1/community
// @access  Private/Admin
export const createPost = async (req, res, next) => {
  try {
    const postData = { ...req.body, createdBy: req.user._id };

    // Format tags from comma-separated string if needed
    if (postData.tags && typeof postData.tags === "string") {
      postData.tags = postData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    // Process files uploaded via Multer Cloudinary
    if (req.files) {
      if (req.files.coverImage) {
        postData.coverImage = req.files.coverImage[0].path;
      }
      if (req.files.galleryImages) {
        postData.galleryImages = req.files.galleryImages.map((file) => file.path);
      }
    }

    // Handle scheduled release date
    if (postData.status === "scheduled" && postData.publishedAt) {
      postData.publishedAt = new Date(postData.publishedAt);
    } else if (postData.status === "published") {
      postData.publishedAt = new Date();
    }

    const post = await CommunityPost.create(postData);

    return res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a community post
// @route   PUT /api/v1/community/:id
// @access  Private/Admin
export const updatePost = async (req, res, next) => {
  try {
    let post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const updateData = { ...req.body };

    // Format tags
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    // Process files
    if (req.files && req.files.coverImage) {
      updateData.coverImage = req.files.coverImage[0].path;
    }

    let existingGallery = [];
    let hasExistingGalleryField = false;

    if (req.body.existingGallery) {
      hasExistingGalleryField = true;
      try {
        existingGallery = JSON.parse(req.body.existingGallery);
      } catch (err) {
        existingGallery = Array.isArray(req.body.existingGallery)
          ? req.body.existingGallery
          : [req.body.existingGallery];
      }
      delete updateData.existingGallery;
    }

    let newGalleryImages = [];
    if (req.files && req.files.galleryImages) {
      newGalleryImages = req.files.galleryImages.map((file) => file.path);
    }

    if (hasExistingGalleryField || (req.files && req.files.galleryImages)) {
      updateData.galleryImages = [...existingGallery, ...newGalleryImages];
    }

    // Adjust publication dates
    if (updateData.status === "scheduled" && updateData.publishedAt) {
      updateData.publishedAt = new Date(updateData.publishedAt);
    } else if (updateData.status === "published" && post.status !== "published") {
      updateData.publishedAt = new Date();
    }

    post = await CommunityPost.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a community post
// @route   DELETE /api/v1/community/:id
// @access  Private/Admin
export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post removed successfully",
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all community posts (Public/Standard Users)
// @route   GET /api/v1/community/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { category, search, sort, featured } = req.query;

    // Standard users only see published posts where the release date has passed
    const filter = {
      status: "published",
      publishedAt: { $lte: new Date() },
    };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Default sorting is newest publication date
    let sortObj = { publishedAt: -1 };
    if (sort === "most-liked") {
      sortObj = { likesCount: -1, publishedAt: -1 };
    } else if (sort === "views") {
      sortObj = { views: -1, publishedAt: -1 };
    } else if (sort === "featured") {
      sortObj = { featured: -1, publishedAt: -1 };
    }

    const posts = await CommunityPost.find(filter).sort(sortObj);

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single community post by slug
// @route   GET /api/v1/community/posts/:slug
// @access  Public
export const getPostBySlug = async (req, res, next) => {
  try {
    // Standard view only allows published/scheduled posts if released
    const post = await CommunityPost.findOne({
      slug: req.params.slug,
      status: "published",
      publishedAt: { $lte: new Date() },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Dynamically increment views count on retrieval
    post.views += 1;
    await post.save();

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like status on a post
// @route   POST /api/v1/community/posts/:id/like
// @access  Private
export const likePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id;
    const isLiked = post.likedBy.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      // Like
      post.likedBy.push(userId);
    }

    post.likesCount = post.likedBy.length;
    await post.save();

    return res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likesCount,
      data: post,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment on a post
// @route   POST /api/v1/community/posts/:id/comment
// @access  Private
export const commentOnPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment body content cannot be empty" });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (!post.commentsEnabled) {
      return res.status(400).json({ success: false, message: "Comments are disabled for this post" });
    }

    // Determine model type for reference
    const userModel = req.user.role === "admin" || req.user.role === "superadmin" ? "Admin" : "User";

    const newComment = {
      userId: req.user._id,
      userModel: userModel,
      userName: req.user.name,
      userAvatar: req.user.avatar || "",
      content: content.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    return res.status(201).json({
      success: true,
      data: post.comments[post.comments.length - 1],
      comments: post.comments,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a comment (User's own or Admin moderation)
// @route   DELETE /api/v1/community/posts/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const isCommentOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    // User must own the comment or have administrative privileges
    if (!isCommentOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    post.comments = post.comments.filter((c) => c._id.toString() !== req.params.commentId);
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comments: post.comments,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all community posts including drafts (Admin only)
// @route   GET /api/v1/community/admin/posts
// @access  Private/Admin
export const adminGetPosts = async (req, res, next) => {
  try {
    const posts = await CommunityPost.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
