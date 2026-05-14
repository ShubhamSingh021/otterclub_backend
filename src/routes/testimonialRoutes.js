import { Router } from "express";
import { testimonialController } from "../controllers/testimonialController.js";

const router = Router();

router.get("/", testimonialController.list);
router.post("/", testimonialController.create);
router.get("/:id", testimonialController.getById);
router.put("/:id", testimonialController.updateById);
router.patch("/:id", testimonialController.updateById);
router.delete("/:id", testimonialController.deleteById);

export default router;
