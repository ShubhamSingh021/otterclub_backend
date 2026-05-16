import { Router } from "express";
import {
  createRegistration,
  getRegistrations,
  getMyRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  resendRegistrationEmail,
  getRegistrationQR,
  verifyRegistrationQR,
  downloadCertificate,
} from "../controllers/registrationController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = Router();

// User routes
router.post("/", protect, createRegistration);
router.get("/my", protect, getMyRegistrations);
router.get("/ticket-qr/:id", protect, getRegistrationQR);
router.get("/certificate/:id", protect, downloadCertificate);

// Admin routes
router.get("/admin", protect, adminOnly, getRegistrations);
router.patch("/admin/:id", protect, adminOnly, updateRegistrationStatus);
router.post("/admin/resend/:id", protect, adminOnly, resendRegistrationEmail);
router.post("/admin/verify-qr", protect, adminOnly, verifyRegistrationQR);
router.delete("/admin/:id", protect, adminOnly, deleteRegistration);

export default router;
