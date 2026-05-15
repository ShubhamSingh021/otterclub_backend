import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
  getEventBySlug,
  getFeaturedEvents,
  getUpcomingEvents,
  toggleVisibility,
  toggleFeatured,
} from "../controllers/eventController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/featured", getFeaturedEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/id/:id", getEventById);
router.get("/:slug", getEventBySlug);

// Admin routes (Protected)
router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "eventImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createEvent
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.fields([
    { name: "eventImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateEvent
);
router.delete("/:id", protect, adminOnly, deleteEvent);
router.patch("/:id/visibility", protect, adminOnly, toggleVisibility);
router.patch("/:id/featured", protect, adminOnly, toggleFeatured);

export default router;
