import { Router } from "express";
import { aboutContentController } from "../controllers/aboutContentController.js";

const router = Router();

router.get("/", aboutContentController.list);
router.post("/", aboutContentController.create);
router.get("/:id", aboutContentController.getById);
router.put("/:id", aboutContentController.updateById);
router.patch("/:id", aboutContentController.updateById);
router.delete("/:id", aboutContentController.deleteById);

export default router;
