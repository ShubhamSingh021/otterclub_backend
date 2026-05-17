import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";
import CommunityPost from "../models/CommunityPost.js";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";

dotenv.config();

const communityPostsSeedData = [
  {
    title: "Otter Athletics Clinches Gold at Regional Championship",
    description: "A historic run by our relay team sets a new tournament record on the final lap.",
    content: `<p>We are incredibly proud to announce that the Otter Society Athletics team has taken home the **Gold Medal** in the 4x400m relay at the Regional Championship! With a final time of <b>3:08.45</b>, our athletes did not just win—they set a brand new regional tournament record!</p><p>Led by captain Marcus Vance and anchored by the explosive finish of Leo Thorne, the team showed unmatched synergy and mental resilience. Training twice a day under coach Sarah Sterling paid off in absolute gold.</p><h3>The Winning Team Lineup:</h3><ul><li>Marcus Vance (Lead Leg)</li><li>Derrick Vance (Second Leg)</li><li>Tobias Gray (Third Leg)</li><li>Leo Thorne (Anchor)</li></ul><p>We invite all members to join us at the Club Lounge this Thursday evening at 7:00 PM for an exclusive victory celebration and meet-and-greet with the champions!</p>`,
    coverImage: "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?q=80&w=800",
    galleryImages: [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800",
      "https://images.unsplash.com/photo-1526676037777-05a233774fba?q=80&w=800"
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Achievement",
    tags: ["champions", "relay", "athletics", "gold-medal"],
    author: "Head Athletics Coach",
    featured: true,
    status: "published",
    views: 148,
    likesCount: 52,
    commentsEnabled: true
  },
  {
    title: "Announcing the Otter Society Annual Summer Gala 2026",
    description: "Tickets are officially live for our most anticipated premium social night of the year.",
    content: `<p>Mark your calendars, because the Otter Society's **Annual Summer Gala** is officially returning on **Saturday, June 20th, 2026**! This year, we are taking over the waterfront grand gardens for an unforgettable evening of premium dining, live jazz music, and club awards.</p><p><b>Theme:</b> Neon Glassmorphism Elegance. Black-tie attire is encouraged with a splash of electric color.</p><p>All active Pro and Elite tier members receive priority tickets and exclusive seating. Early bird registrations are open now in the Events tab!</p>`,
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800",
    galleryImages: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=800"
    ],
    videoUrl: "",
    category: "Announcement",
    tags: ["gala", "social", "announcement", "summer"],
    author: "Otter Club Committee",
    featured: false,
    status: "published",
    views: 89,
    likesCount: 22,
    commentsEnabled: true
  },
  {
    title: "Member Spotlight: How Sarah Jenkins Conquered Her First Triathlon",
    description: "From zero pool laps to a podium finish, Sarah shares her inspirational fitness journey.",
    content: `<p>In our latest Member Spotlight, we sit down with **Sarah Jenkins**, who joined the Otter Society last autumn with a simple goal: learning how to swim efficiently. Fast forward nine months, and Sarah recently clinched 3rd place in her age category at the Lakeside Sprint Triathlon!</p><p>We talked with Sarah about overcoming a fear of open-water swimming, balancing training with a demanding career, and utilizing the club's coaching network to push past her boundaries.</p><blockquote>"The community at the Otter Society kept me accountable. When I wanted to skip early morning sessions, my teammates were waiting at the pool."</blockquote>`,
    coverImage: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=800",
    galleryImages: [
      "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=800"
    ],
    videoUrl: "",
    category: "Member Spotlight",
    tags: ["spotlight", "triathlon", "swimming", "fitness"],
    author: "Otter Society Admin",
    featured: true,
    status: "published",
    views: 215,
    likesCount: 94,
    commentsEnabled: true
  },
  {
    title: "Tournament Recap: Spring Doubles Tennis Cup",
    description: "Highlights and final scores from last weekend's fierce clay court doubles bracket.",
    content: `<p>The clay courts were sizzling last Saturday as over 24 doubles pairings battled it out in our Spring Doubles Tennis Cup! The tournament culminated in an absolute nail-biter final between returning champions Patel & Alvarez and newcomers Chen & Murphy.</p><p>After dropping the first set 4-6, Patel and Alvarez staged a magnificent comeback, winning the second set 7-5 and securing the tiebreaker 10-8 in front of a roaring crowd.</p>`,
    coverImage: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800",
    galleryImages: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800"
    ],
    videoUrl: "",
    category: "Event Recap",
    tags: ["tennis", "recap", "tournament", "clay-court"],
    author: "Tennis Coordinator",
    featured: false,
    status: "published",
    views: 110,
    likesCount: 35,
    commentsEnabled: true
  },
  {
    title: "Partnering with Zenith Gear for Premium Member Equipment Discounts",
    description: "Active members now receive exclusive 20% discounts on all Zenith athletic footwear and wear.",
    content: `<p>We are thrilled to officially announce our corporate sponsorship partnership with **Zenith Sports Gear**! As a premium sports provider, Zenith shares our dedication to athletic performance and quality.</p><p>Starting next Monday, all verified Otter Society members can claim a <b>20% discount code</b> valid at all online and retail outlets. To retrieve your discount code, check the Member Benefits drawer in your Personal Dashboard.</p>`,
    coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800",
    galleryImages: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"
    ],
    videoUrl: "",
    category: "Sponsor Update",
    tags: ["sponsor", "discount", "zenith", "gear"],
    author: "Otter Club Director",
    featured: false,
    status: "published",
    views: 74,
    likesCount: 18,
    commentsEnabled: false
  }
];

const seedCommunity = async () => {
  try {
    await connectDatabase(env.mongoUri);

    // Look for an existing superadmin/admin user
    let adminUser = await Admin.findOne({ role: { $in: ["superadmin", "admin"] } });

    if (!adminUser) {
      console.log("No existing Admin user found. Creating a default super admin...");
      adminUser = await Admin.create({
        name: "Super Admin",
        email: "admin@example.com",
        password: "adminpassword123", // Hashes on save
        role: "superadmin"
      });
      console.log("Default admin created: admin@example.com / adminpassword123");
    }

    // Clean up any existing seeded community posts to avoid overlap/duplication
    await CommunityPost.deleteMany({});
    console.log("Cleared existing community posts.");

    const seedWithAdmin = communityPostsSeedData.map((post) => ({
      ...post,
      createdBy: adminUser._id
    }));

    await CommunityPost.create(seedWithAdmin);
    console.log("Successfully seeded 5 beautiful community highlights posts!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding community posts:", error);
    process.exit(1);
  }
};

seedCommunity();
