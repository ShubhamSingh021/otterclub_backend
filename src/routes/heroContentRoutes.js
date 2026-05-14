import { Router } from "express";
import { heroContentController } from "../controllers/heroContentController.js";

const router = Router();

router.get("/", heroContentController.list);
router.post("/", heroContentController.create);
router.get("/:id", heroContentController.getById);
router.put("/:id", heroContentController.updateById);
router.patch("/:id", heroContentController.updateById);
router.delete("/:id", heroContentController.deleteById);

export default router;
