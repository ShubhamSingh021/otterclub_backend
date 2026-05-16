import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  getMyRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from "../controllers/registrationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

// User routes
router.post("/", createRegistration);
router.get("/my", protect, getMyRegistrations);

// Admin routes
router.get("/admin", protect, adminOnly, getRegistrations);
router.patch("/admin/:id", protect, adminOnly, updateRegistrationStatus);
router.delete("/admin/:id", protect, adminOnly, deleteRegistration);

export default router;
