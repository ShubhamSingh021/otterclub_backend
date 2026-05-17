import express from "express";
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponStats,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/validate", protect, validateCoupon);

// Admin routes
router.get("/admin/list", protect, adminOnly, getAllCoupons);
router.get("/admin/stats", protect, adminOnly, getCouponStats);
router.post("/admin", protect, adminOnly, createCoupon);
router.put("/admin/:id", protect, adminOnly, updateCoupon);
router.delete("/admin/:id", protect, adminOnly, deleteCoupon);
router.patch("/admin/:id/toggle", protect, adminOnly, toggleCouponStatus);

export default router;
