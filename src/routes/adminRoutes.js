import express from "express";
import { getAdminProfile, loginAdmin, getAnalytics } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protect, getAdminProfile);
router.get("/analytics", protect, getAnalytics);

export default router;
