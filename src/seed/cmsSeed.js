import mongoose from "mongoose";
import dotenv from "dotenv";
import HeroContent from "../models/HeroContent.js";
import StatsContent from "../models/StatsContent.js";
import AboutContent from "../models/AboutContent.js";
import HomeSection from "../models/HomeSection.js";
import SiteSettings from "../models/SiteSettings.js";

dotenv.config();

const seedCMS = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for CMS seeding...");

    // 1. Hero Content
    await HeroContent.deleteMany({});
    await HeroContent.create({
      title: "Join the Elite Otter Society",
      subtitle: "The premier sports community for athletes and enthusiasts. Push your limits, find your team, and dominate the field.",
      primaryCta: { label: "Join Now", href: "/register" },
      secondaryCta: { label: "View Events", href: "/events" },
      backgroundImageUrl: "/hero-bg.png",
      isActive: true
    });
    console.log("Hero Content seeded.");

    // 2. Stats
    await StatsContent.deleteMany({});
    await StatsContent.create({
      clubCount: 25,
      stateCount: 12,
      isActive: true
    });
    console.log("Stats seeded.");

    // 3. About
    await AboutContent.deleteMany({});
    await AboutContent.create({
      heading: "Our Story & Vision",
      description: "Otter Society was founded with a simple goal: to connect sports lovers across the country through high-quality events and a supportive community.",
      mission: "To inspire athletes of all levels to achieve their personal best.",
      vision: "To be the #1 sports platform in the region.",
      imageUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=2070",
      isActive: true
    });
    console.log("About Content seeded.");

    // 4. Why Join (HomeSection)
    await HomeSection.deleteMany({ key: "whyJoinUs" });
    await HomeSection.create({
      key: "whyJoinUs",
      title: "Why Join Otter Society?",
      subtitle: "Experience the benefits of being part of a premium sports club.",
      cards: [
        { title: "Elite Coaching", description: "Learn from the best trainers in the industry.", meta: "trophy" },
        { title: "Global Community", description: "Network with over 10,000+ active members.", meta: "users" },
        { title: "Premium Events", description: "Access to exclusive tournaments and meetups.", meta: "calendar" }
      ]
    });
    console.log("Why Join Section seeded.");

    // 5. Site Settings
    await SiteSettings.deleteMany({});
    await SiteSettings.create({
      siteName: "Otter Society",
      contact: {
        email: "hello@ottersociety.com",
        phone: "+1 234 567 890",
        whatsapp: "+1 234 567 890",
        address: "123 Sporty Way, Athletic City"
      },
      socialLinks: [
        { label: "instagram", href: "https://instagram.com/ottersociety" },
        { label: "facebook", href: "https://facebook.com/ottersociety" },
        { label: "twitter", href: "https://twitter.com/ottersociety" },
        { label: "linkedin", href: "https://linkedin.com/company/ottersociety" }
      ],
      isActive: true
    });
    console.log("Site Settings seeded.");

    console.log("CMS Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding CMS:", error);
    process.exit(1);
  }
};

seedCMS();
