import SiteSettings from "../models/SiteSettings.js";
import { createCrudController } from "./crudFactory.js";

export const siteSettingsController = createCrudController(SiteSettings, {
  defaultSort: "-updatedAt",
});
