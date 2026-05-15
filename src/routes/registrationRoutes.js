import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
} from "../controllers/registrationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route
router.post("/", createRegistration);

// Admin routes
router.get("/admin", protect, adminOnly, getRegistrations);
router.patch("/admin/:id", protect, adminOnly, updateRegistrationStatus);
router.delete("/admin/:id", protect, adminOnly, deleteRegistration);

export default router;
