import express from "express";
import { createOrder, verifyPayment, getAllPayments } from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllPayments);

export default router;
