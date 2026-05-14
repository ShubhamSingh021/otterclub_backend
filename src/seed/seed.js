import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import AboutContent from "../models/AboutContent.js";
import HeroContent from "../models/HeroContent.js";
import HomeSection from "../models/HomeSection.js";
import SiteSettings from "../models/SiteSettings.js";
import Testimonial from "../models/Testimonial.js";
import {
  aboutContentSeed,
  heroContentSeed,
  homeSectionsSeed,
  siteSettingsSeed,
  testimonialsSeed,
} from "./seedData.js";

const clearCollections = async () => {
  await Promise.all([
    SiteSettings.deleteMany({}),
    HeroContent.deleteMany({}),
    AboutContent.deleteMany({}),
    HomeSection.deleteMany({}),
    Testimonial.deleteMany({}),
  ]);
};

const insertSeedData = async () => {
  await Promise.all([
    SiteSettings.create(siteSettingsSeed),
    HeroContent.create(heroContentSeed),
    AboutContent.create(aboutContentSeed),
    HomeSection.insertMany(homeSectionsSeed),
    Testimonial.insertMany(testimonialsSeed),
  ]);
};

const runSeed = async () => {
  try {
    if (env.nodeEnv === "production") {
      throw new Error("Seeding is disabled in production.");
    }

    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    await clearCollections();
    console.log("Cleared existing CMS collections.");

    await insertSeedData();
    console.log("Seed data inserted successfully.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

runSeed();
