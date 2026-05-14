import AboutContent from "../models/AboutContent.js";
import { createCrudController } from "./crudFactory.js";

export const aboutContentController = createCrudController(AboutContent, {
  defaultSort: "-updatedAt",
});
