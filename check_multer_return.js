import { upload } from "./src/config/cloudinary.js";
const middleware = upload.fields([
  { name: "eventImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 5 },
]);
console.log("Middleware type:", typeof middleware);
process.exit(0);
