import { upload } from "./src/config/cloudinary.js";
console.log("Upload fields:", typeof upload.fields);
console.log("Upload single:", typeof upload.single);
console.log("Upload array:", typeof upload.array);
process.exit(0);
