import AboutContent from "../models/AboutContent.js";
import HeroContent from "../models/HeroContent.js";
import HomeSection from "../models/HomeSection.js";
import SiteSettings from "../models/SiteSettings.js";
import Testimonial from "../models/Testimonial.js";

export const getHomePageContent = async (_req, res) => {
  const [siteSettings, heroContent, aboutContent, sections, testimonials] =
    await Promise.all([
      SiteSettings.findOne({ isActive: true }).sort("-updatedAt").lean(),
      HeroContent.findOne({ isActive: true }).sort("-updatedAt").lean(),
      AboutContent.findOne({ isActive: true }).sort("-updatedAt").lean(),
      HomeSection.find({ isActive: true }).sort("order -updatedAt").lean(),
      Testimonial.find({ isActive: true }).sort("-isFeatured -updatedAt").lean(),
    ]);

  const homepageSections = sections.reduce((acc, section) => {
    if (!acc[section.key]) {
      acc[section.key] = section;
    }
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      siteSettings,
      heroContent,
      aboutContent,
      testimonials,
      homepageSections,
    },
  });
};
