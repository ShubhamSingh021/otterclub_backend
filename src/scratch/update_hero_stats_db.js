import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import StatsContent from "../models/StatsContent.js";
import HeroContent from "../models/HeroContent.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB successfully.");

    // 1. Update/Initialize StatsContent
    console.log("Initializing/Updating StatsContent...");
    const existingStats = await StatsContent.findOne({ isActive: true });
    
    const statsData = {
      clubCount: existingStats?.clubCount || 12,
      stateCount: existingStats?.stateCount || 4,
      stat1Label: "Athletes & Members",
      stat1Value: "2,500+",
      stat2Label: "Coaching Sessions / Month",
      stat2Value: "320+",
      stat3Label: "Active Programs",
      stat3Value: "18",
      stat4Label: "Weekly Community Events",
      stat4Value: "12",
      isActive: true,
    };

    const updatedStats = await StatsContent.findOneAndUpdate(
      { isActive: true },
      statsData,
      { upsert: true, new: true }
    );
    console.log("StatsContent initialized/updated successfully:", updatedStats);

    // 2. Update Hero CTA link from '#why-join' to '/membership'
    console.log("Updating active HeroContent CTA link...");
    const hero = await HeroContent.findOne({ isActive: true });
    if (hero) {
      console.log(`Current Hero primaryCta: label="${hero.primaryCta?.label}", href="${hero.primaryCta?.href}"`);
      
      hero.primaryCta = {
        label: hero.primaryCta?.label || "Explore Membership",
        href: "/membership"
      };

      await hero.save();
      console.log("HeroContent primaryCta updated successfully.");
    } else {
      console.log("No active HeroContent document found to update.");
    }

  } catch (error) {
    console.error("Migration script failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

run();
