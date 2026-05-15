import express from "express";
import {
  updateHeroSection,
  updateAboutSection,
  updateHomeSection,
  updateStatsSection,
  updateSiteSettings,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getStats
} from "../controllers/cmsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// All CMS routes are protected and admin only
router.use(protect);
router.use(adminOnly);

router.post("/hero", upload.single("heroImage"), updateHeroSection);
router.post("/about", upload.single("aboutImage"), updateAboutSection);
router.post("/section/:key", updateHomeSection);
router.post("/stats", updateStatsSection);
router.post("/settings", upload.single("logoUrl"), updateSiteSettings);

// Testimonials CRUD
router.post("/testimonials", upload.single("avatarUrl"), createTestimonial);
router.put("/testimonials/:id", upload.single("avatarUrl"), updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

// Stats retrieval
router.get("/stats-data", getStats);

export default router;
