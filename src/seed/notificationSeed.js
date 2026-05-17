import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "../models/Notification.js";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";

dotenv.config();

const mockNotifications = [
  // PAYMENT CATEGORY
  {
    title: "Razorpay Transaction Successful",
    message: "Your payment of ₹1,499 for 'Otter Society Pro Membership Upgrade' was successfully processed. You can download your invoice from the payments tab.",
    type: "payment",
    link: "/dashboard?tab=payments",
    read: false
  },
  {
    title: "Refund Processed: Summer Gala Ticket",
    message: "A refund of ₹499 has been successfully initiated for the Summer Gala VIP admission. The amount will be credited to your bank account within 5-7 business days.",
    type: "payment",
    link: "/dashboard?tab=payments",
    read: false
  },
  {
    title: "Annual Billing Cycle Reminder",
    message: "Your Elite Tier Membership annual subscription renewal is scheduled for next month. A 10% loyalty discount coupon (LOYALOTTER10) has been automatically applied to your account.",
    type: "payment",
    link: "/dashboard?tab=payments",
    read: true
  },

  // EVENT CATEGORY
  {
    title: "New Event: Neon Tennis Clay-Court Cup",
    message: "Registration is now officially open for our premium Doubles Tennis Cup! Exclusive early bird discount codes are valid for the next 48 hours.",
    type: "event",
    link: "/events",
    read: false
  },
  {
    title: "Event Update: Summer Gala Venue Upgrade",
    message: "Due to high demand, the Summer Gala has been upgraded to the Grand Waterfront Lawn. Exclusive seating schedules are updated on your registration tickets.",
    type: "event",
    link: "/events",
    read: false
  },
  {
    title: "Attendance Recorded & QR Verified",
    message: "Thank you for attending the Morning Athletics bootcamp! Your QR code was successfully verified by Coach Sarah. Your attendance has been registered.",
    type: "event",
    link: "/dashboard?tab=tickets",
    read: true
  },

  // MEMBERSHIP CATEGORY
  {
    title: "Congratulations on Elite Status!",
    message: "Welcome to the absolute pinnacle of our community! You now have unrestricted access to premium athletic facilities, private lounges, and VIP gala events.",
    type: "membership",
    link: "/membership",
    read: false
  },
  {
    title: "Membership Tier Benefits Extended",
    message: "We've added exclusive partner discounts to all Pro & Elite members. Enjoy a 20% discount on athletic gear at Zenith Sports stores with coupon code ZENITH20.",
    type: "membership",
    link: "/membership",
    read: false
  },
  {
    title: "Plan Renewal Successful",
    message: "Your Basic Tier Membership has successfully renewed. Thank you for being a vital part of the Otter Society family! Keep running, swimming, and thriving.",
    type: "membership",
    link: "/membership",
    read: true
  },

  // REMINDER CATEGORY
  {
    title: "Reminder: QR Ticket Ready for Scanning",
    message: "The Morning Athletics bootcamp starts in 2 hours! Please ensure your QR code ticket is open and ready to scan at the main court entrance.",
    type: "reminder",
    link: "/dashboard?tab=tickets",
    read: false
  },
  {
    title: "Upcoming Event Checklist",
    message: "Got your tennis gear ready? The Clay-Court Tennis Cup starts tomorrow at 9:00 AM. Remember to carry a personal hydration flask for the match.",
    type: "reminder",
    link: "/events",
    read: false
  },
  {
    title: "Profile Completion Reminder",
    message: "Complete your premium membership profile details to gain priority booking access to all upcoming private court slots.",
    type: "reminder",
    link: "/dashboard?tab=profile",
    read: true
  },

  // ANNOUNCEMENT CATEGORY
  {
    title: "New Hydro-Training Pool Opening Soon!",
    message: "We are thrilled to announce that construction of our Olympic-grade heated hydro-training pool is 95% complete. Ribbon cutting and grand launch is next Friday!",
    type: "announcement",
    link: "/",
    read: false
  },
  {
    title: "Holiday Operating Hours Updated",
    message: "The Otter Society facilities will remain open on public holidays with revised timing (8:00 AM to 6:00 PM). Private booking court slots remain unchanged.",
    type: "announcement",
    link: "/",
    read: false
  },
  {
    title: "Otter Society Annual Charity Campaign",
    message: "Together, we raised over ₹5,00,000 for local youth sports development programs during our annual run! Thank you to every participant and sponsor.",
    type: "announcement",
    link: "/",
    read: true
  },

  // REVIEW CATEGORY
  {
    title: "Testimonial Published to Live CMS",
    message: "Your review of the Tennis Clay-Court Cup has been approved by the moderation team and is now featured on the Otter Society public homepage!",
    type: "review",
    link: "/dashboard?tab=reviews",
    read: false
  },
  {
    title: "Help Us Improve: Rate the Summer Gala",
    message: "We'd love to hear your feedback on the Summer Gala. Submit a quick 1-minute rating and review to earn a 5% discount code for your next registration.",
    type: "review",
    link: "/dashboard?tab=reviews",
    read: false
  },
  {
    title: "Review Approved by Moderation",
    message: "Your feedback on the membership onboarding process has been successfully moderated. Thank you for helping us design a more authentic club experience.",
    type: "review",
    link: "/dashboard?tab=reviews",
    read: true
  },

  // ADMIN CATEGORY
  {
    title: "Otter Society Code of Conduct Update",
    message: "To guarantee safety and comfort for all runners and swimmers, we have updated our court reservation guidelines. Please review the updated terms.",
    type: "admin",
    link: "/",
    read: false
  },
  {
    title: "Security Updates: Two-Factor Auth Live",
    message: "Protect your Otter Society ticket wallet and payments. You can now enable enhanced authentication settings from your security tab.",
    type: "admin",
    link: "/dashboard?tab=profile",
    read: false
  },
  {
    title: "System Maintenance Completed",
    message: "Our servers have successfully upgraded to database v2.0. Enjoy faster page loading speeds, instant ticket rendering, and seamless checkout flows.",
    type: "admin",
    link: "/",
    read: true
  }
];

const seedNotifications = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB for notification seeding...");

    // Clear existing global/seeded notifications to prevent redundancy
    await Notification.deleteMany({ userId: null });
    console.log("Cleared existing global notifications.");

    // Seed new notifications
    const seeded = await Notification.insertMany(mockNotifications);
    console.log(`Successfully seeded ${seeded.length} mock notifications (3 per category) globally!`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding notifications:", error);
    process.exit(1);
  }
};

seedNotifications();
