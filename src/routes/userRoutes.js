import { Router } from "express";
import { getUserPayments, getMembershipQR } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/payments", protect, getUserPayments);
router.get("/membership-qr", protect, getMembershipQR);

export default router;
