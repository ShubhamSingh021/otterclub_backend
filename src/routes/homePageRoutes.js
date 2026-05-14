import { Router } from "express";
import { getHomePageContent } from "../controllers/homePageController.js";

const router = Router();

router.get("/", getHomePageContent);

export default router;
