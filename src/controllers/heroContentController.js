import HeroContent from "../models/HeroContent.js";
import { createCrudController } from "./crudFactory.js";

export const heroContentController = createCrudController(HeroContent, {
  defaultSort: "-updatedAt",
});
