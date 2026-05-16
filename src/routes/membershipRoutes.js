import express from "express";
import {
  createMembershipOrder,
  verifyMembershipPayment,
  getMyMembership,
  getMembershipHistory,
  getPlans,
} from "../controllers/membershipController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/my", protect, getMyMembership);
router.get("/history", protect, getMembershipHistory);
router.post("/create-order", protect, createMembershipOrder);
router.post("/verify-payment", protect, verifyMembershipPayment);

export default router;
