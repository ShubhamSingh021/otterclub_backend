import express from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostBySlug,
  likePost,
  commentOnPost,
  deleteComment,
  adminGetPosts,
} from "../controllers/communityController.js";
import { protect, adminOnly, optionalProtect } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// --- PUBLIC FEED ROUTES ---
router.get("/posts", getPosts);
router.get("/posts/:slug", getPostBySlug);

// --- USER INTERACTION ROUTES (Protected) ---
router.post("/posts/:id/like", protect, likePost);
router.post("/posts/:id/comment", protect, commentOnPost);
router.delete("/posts/:id/comment/:commentId", protect, deleteComment);

// --- ADMIN MANAGEMENT ROUTES (Protected & Admin Only) ---
router.get("/admin/posts", protect, adminOnly, adminGetPosts);
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createPost
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updatePost
);
router.delete("/:id", protect, adminOnly, deletePost);

export default router;
