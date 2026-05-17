import dotenv from "dotenv";
// Load env vars
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = [
  "MONGODB_URI",
  "RESEND_API_KEY",
  "CLIENT_ORIGIN"
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[CRITICAL] Missing required environment variable: ${key}`);
    // We don't throw error here to allow the app to start even if email is broken, 
    // but we will throw error in emailService when sending fails.
  }
});

const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: process.env.CLIENT_ORIGIN 
    ? process.env.CLIENT_ORIGIN.split(",").map(origin => origin.trim().replace(/\/$/, "")) 
    : ["http://localhost:5173"],
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "fallback_secret",
  jwtExpire: process.env.JWT_EXPIRE || "30d",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || "onboarding@resend.dev",
  fromName: process.env.FROM_NAME || "Otter Society",
};

export default env;
