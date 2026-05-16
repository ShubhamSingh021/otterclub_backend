import express from "express";
import { 
  getAllPlans, 
  getAdminPlans, 
  createPlan, 
  updatePlan, 
  deletePlan 
} from "../controllers/planController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/", getAllPlans);

// Admin routes
router.get("/admin", protect, adminOnly, getAdminPlans);
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);

export default router;
