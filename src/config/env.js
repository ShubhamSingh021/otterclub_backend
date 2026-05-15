import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
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
};

export default env;
