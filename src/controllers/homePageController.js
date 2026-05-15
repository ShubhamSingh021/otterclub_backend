import AboutContent from "../models/AboutContent.js";
import Event from "../models/Event.js";
import HeroContent from "../models/HeroContent.js";
import HomeSection from "../models/HomeSection.js";
import SiteSettings from "../models/SiteSettings.js";
import Testimonial from "../models/Testimonial.js";
import StatsContent from "../models/StatsContent.js";
import User from "../models/User.js";

export const getHomePageContent = async (_req, res) => {
  const [siteSettings, heroContent, aboutContent, sections, testimonials, featuredEvents, statsContent, totalMembers, totalEventsCount] =
    await Promise.all([
      SiteSettings.findOne({ isActive: true }).sort("-updatedAt").lean(),
      HeroContent.findOne({ isActive: true }).sort("-updatedAt").lean(),
      AboutContent.findOne({ isActive: true }).sort("-updatedAt").lean(),
      HomeSection.find({ isActive: true }).sort("order -updatedAt").lean(),
      Testimonial.find({ isActive: true }).sort("-isFeatured -updatedAt").lean(),
      Event.find({
        $or: [{ isFeatured: true }, { featured: true }],
        isVisible: true,
        status: { $regex: /^upcoming$/i },
      })
        .sort({ eventDate: 1 })
        .limit(6)
        .lean(),
      StatsContent.findOne({ isActive: true }).lean(),
      User.countDocuments(),
      Event.countDocuments(),
    ]);

  console.log("HOMEPAGE_DEBUG: Found featuredEvents count:", featuredEvents?.length);
  if (featuredEvents?.length > 0) {
    console.log("HOMEPAGE_DEBUG: First event title:", featuredEvents[0].title);
  } else {
    // Debug: Check if ANY visible events exist
    const totalVisible = await Event.countDocuments({ isVisible: true });
    const totalFeatured = await Event.countDocuments({ isFeatured: true });
    const sample = await Event.findOne({ isFeatured: true }).lean();
    console.log("HOMEPAGE_DEBUG: No featured upcoming events found.");
    console.log(`HOMEPAGE_DEBUG: Stats - Visible: ${totalVisible}, Featured: ${totalFeatured}`);
    if (sample) {
      console.log("HOMEPAGE_DEBUG: Sample featured event status:", sample.status);
    }
  }

  const homepageSections = sections.reduce((acc, section) => {
    acc[section.key] = section;
    return acc;
  }, {});

  return res.status(200).json({
    success: true,
    data: {
      siteSettings,
      heroContent,
      aboutContent,
      testimonials,
      homepageSections,
      featuredEvents,
      stats: {
        totalMembers,
        totalEvents: totalEventsCount,
        clubCount: statsContent?.clubCount || 0,
        stateCount: statsContent?.stateCount || 0,
      },
    },
  });
};
