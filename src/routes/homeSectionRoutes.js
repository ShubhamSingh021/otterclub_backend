import { Router } from "express";
import { homeSectionController } from "../controllers/homeSectionController.js";

const router = Router();

router.get("/", homeSectionController.list);
router.post("/", homeSectionController.create);
router.get("/:id", homeSectionController.getById);
router.put("/:id", homeSectionController.updateById);
router.patch("/:id", homeSectionController.updateById);
router.delete("/:id", homeSectionController.deleteById);

export default router;
