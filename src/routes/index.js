import { Router } from "express";
import aboutContentRoutes from "./aboutContentRoutes.js";
import heroContentRoutes from "./heroContentRoutes.js";
import homePageRoutes from "./homePageRoutes.js";
import homeSectionRoutes from "./homeSectionRoutes.js";
import siteSettingsRoutes from "./siteSettingsRoutes.js";
import testimonialRoutes from "./testimonialRoutes.js";
import adminRoutes from "./adminRoutes.js";
import eventRoutes from "./eventRoutes.js";

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

export default router;
