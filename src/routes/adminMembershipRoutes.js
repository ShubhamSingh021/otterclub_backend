import express from "express";
import {
  getAllMemberships,
  updateMembershipStatus,
  extendMembership,
  deleteMembership,
} from "../controllers/adminMembershipController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAllMemberships);
router.patch("/:id/status", updateMembershipStatus);
router.patch("/:id/extend", extendMembership);
router.delete("/:id", deleteMembership);

export default router;
