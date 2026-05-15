import AboutContent from "../models/AboutContent.js";
import Event from "../models/Event.js";
import HeroContent from "../models/HeroContent.js";
import HomeSection from "../models/HomeSection.js";
import SiteSettings from "../models/SiteSettings.js";
import StatsContent from "../models/StatsContent.js";
import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

// @desc    Update Hero Section
// @route   POST /api/v1/cms/hero
export const updateHeroSection = async (req, res) => {
  try {
    const { heroTitle, heroSubtitle, primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink } = req.body;
    
    const updateData = {
      title: heroTitle,
      subtitle: heroSubtitle,
      primaryCta: { label: primaryCtaText, href: primaryCtaLink },
      secondaryCta: { label: secondaryCtaText, href: secondaryCtaLink },
      isActive: true
    };

    if (req.file) {
      updateData.backgroundImageUrl = req.file.path;
    }
    
    const hero = await HeroContent.findOneAndUpdate(
      { isActive: true },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: hero });
  } catch (error) {
    console.error("Hero update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update About Section
// @route   POST /api/v1/cms/about
export const updateAboutSection = async (req, res) => {
  try {
    const { heading, description, mission, vision } = req.body;
    
    const updateData = {
      heading,
      description,
      mission,
      vision,
      isActive: true
    };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }
    
    const about = await AboutContent.findOneAndUpdate(
      { isActive: true },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );
    
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    console.error("About update error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Home Section (Why Join Us, etc.)
// @route   POST /api/v1/cms/section/:key
export const updateHomeSection = async (req, res) => {
  try {
    const { key } = req.params;
    const updateData = { ...req.body, key, isActive: true };
    
    const section = await HomeSection.findOneAndUpdate(
      { key, isActive: true },
      updateData,
      { upsert: true, new: true }
    );
    
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Stats Section
// @route   POST /api/v1/cms/stats
export const updateStatsSection = async (req, res) => {
  try {
    const updateData = { ...req.body, isActive: true };
    
    const stats = await StatsContent.findOneAndUpdate(
      { isActive: true },
      updateData,
      { upsert: true, new: true }
    );
    
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Site Settings (Contact & Socials)
// @route   POST /api/v1/cms/settings
export const updateSiteSettings = async (req, res) => {
  try {
    const updateData = { ...req.body, isActive: true };
    
    // Parse JSON strings from FormData if necessary
    if (typeof updateData.contact === 'string') {
      try { updateData.contact = JSON.parse(updateData.contact); } catch (e) {}
    }
    if (typeof updateData.socialLinks === 'string') {
      try { updateData.socialLinks = JSON.parse(updateData.socialLinks); } catch (e) {}
    }
    if (typeof updateData.navigationLinks === 'string') {
      try { updateData.navigationLinks = JSON.parse(updateData.navigationLinks); } catch (e) {}
    }
    if (typeof updateData.globalCta === 'string') {
      try { updateData.globalCta = JSON.parse(updateData.globalCta); } catch (e) {}
    }

    if (req.file) {
      updateData.logoUrl = req.file.path;
    }
    
    const settings = await SiteSettings.findOneAndUpdate(
      { isActive: true },
      updateData,
      { upsert: true, new: true }
    );
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Testimonials CRUD
export const createTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.avatarUrl = req.file.path;
    }
    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.avatarUrl = req.file.path;
    }
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, data, { new: true });
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const manualStats = await StatsContent.findOne({ isActive: true }).lean();
    
    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalEvents,
        clubCount: manualStats?.clubCount || 0,
        stateCount: manualStats?.stateCount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
