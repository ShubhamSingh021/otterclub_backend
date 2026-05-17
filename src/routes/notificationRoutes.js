import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
} from "../controllers/notificationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User notification routes
router.get("/", protect, getUserNotifications);
router.put("/read-all", protect, markAllAsRead);
router.put("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

// Admin notification routes
router.post("/admin/broadcast", protect, adminOnly, broadcastNotification);

export default router;
