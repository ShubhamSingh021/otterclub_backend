import { Router } from "express";
import { testimonialController } from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import Testimonial from "../models/Testimonial.js";

const router = Router();

// Public route to fetch approved reviews
router.get("/", async (req, res) => {
  try {
    const list = await Testimonial.find({ isActive: true, status: "approved" })
      .sort("-isFeatured -updatedAt")
      .lean();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User protected routes
router.get("/eligibility", protect, testimonialController.getEligibility);
router.post("/submit", protect, testimonialController.submitReview);
router.get("/my-reviews", protect, testimonialController.getMyReviews);
router.put("/my-reviews/:id", protect, testimonialController.updateMyReview);
router.delete("/my-reviews/:id", protect, testimonialController.deleteMyReview);

// Admin protected routes
router.get("/admin/list", protect, adminOnly, testimonialController.adminListReviews);
router.patch("/admin/:id/status", protect, adminOnly, testimonialController.adminUpdateStatus);
router.patch("/admin/:id/featured", protect, adminOnly, testimonialController.adminToggleFeatured);

// Original CMS CRUD routes for direct admin fallback compatibility
router.get("/:id", testimonialController.getById);
router.post("/", protect, adminOnly, testimonialController.create);
router.put("/:id", protect, adminOnly, testimonialController.updateById);
router.patch("/:id", protect, adminOnly, testimonialController.updateById);
router.delete("/:id", protect, adminOnly, testimonialController.deleteById);

export default router;
