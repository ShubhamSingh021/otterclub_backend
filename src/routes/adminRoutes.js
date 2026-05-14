import express from "express";
import { getAdminProfile, loginAdmin } from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/profile", protect, getAdminProfile);

export default router;
