import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const requiredEnvVars = [
  "MONGODB_URI",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_EMAIL",
  "SMTP_PASSWORD",
  "FROM_EMAIL",
  "FROM_NAME",
  "CLIENT_ORIGIN"
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[CRITICAL] Missing required environment variable: ${key}`);
    // We don't throw error here to allow the app to start even if email is broken, 
    // but we will throw error in emailUtils when sending fails.
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
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME || "Otter Society",
  },
};

export default env;
