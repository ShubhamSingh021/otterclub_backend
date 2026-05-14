import { Router } from "express";
import { siteSettingsController } from "../controllers/siteSettingsController.js";

const router = Router();

router.get("/", siteSettingsController.list);
router.post("/", siteSettingsController.create);
router.get("/:id", siteSettingsController.getById);
router.put("/:id", siteSettingsController.updateById);
router.patch("/:id", siteSettingsController.updateById);
router.delete("/:id", siteSettingsController.deleteById);

export default router;
