import { Router } from "express";
import aboutContentRoutes from "./aboutContentRoutes.js";
import heroContentRoutes from "./heroContentRoutes.js";
import homePageRoutes from "./homePageRoutes.js";
import homeSectionRoutes from "./homeSectionRoutes.js";
import siteSettingsRoutes from "./siteSettingsRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import adminRoutes from "./adminRoutes.js";
import eventRoutes from "./eventRoutes.js";
import cmsRoutes from "./cmsRoutes.js";
import registrationRoutes from "./registrationRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import authRoutes from "./authRoutes.js";
import membershipRoutes from "./membershipRoutes.js";
import adminMembershipRoutes from "./adminMembershipRoutes.js";
import planRoutes from "./planRoutes.js";
import userRoutes from "./userRoutes.js";
import communityRoutes from "./communityRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Club API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/homepage", homePageRoutes);
router.use("/site-settings", siteSettingsRoutes);
router.use("/hero-content", heroContentRoutes);
router.use("/about-content", aboutContentRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/home-sections", homeSectionRoutes);
router.use("/admin", adminRoutes);
router.use("/events", eventRoutes);
router.use("/cms", cmsRoutes);
router.use("/registrations", registrationRoutes);
router.use("/payments", paymentRoutes);
router.use("/auth", authRoutes);
router.use("/membership", membershipRoutes);
router.use("/admin/memberships", adminMembershipRoutes);
router.use("/plans", planRoutes);
router.use("/user", userRoutes);
router.use("/community", communityRoutes);

export default router;
