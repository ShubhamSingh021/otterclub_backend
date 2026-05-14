import Testimonial from "../models/Testimonial.js";
import { createCrudController } from "./crudFactory.js";

export const testimonialController = createCrudController(Testimonial, {
  defaultSort: "-isFeatured -updatedAt",
});
