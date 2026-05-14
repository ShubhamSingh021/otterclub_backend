import HomeSection from "../models/HomeSection.js";
import { createCrudController } from "./crudFactory.js";

export const homeSectionController = createCrudController(HomeSection, {
  defaultSort: "order -updatedAt",
});
