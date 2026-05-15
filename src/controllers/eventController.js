import Event from "../models/Event.js";

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private/Admin
export const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, createdBy: req.user._id };

    if (req.files) {
      if (req.files.eventImage) {
        eventData.eventImage = req.files.eventImage[0].path;
      }
      if (req.files.galleryImages) {
        eventData.galleryImages = req.files.galleryImages.map((file) => file.path);
      }
    }

    const event = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const updateData = { ...req.body };
    if (req.files) {
      if (req.files.eventImage) {
        updateData.eventImage = req.files.eventImage[0].path;
      }
      if (req.files.galleryImages) {
        updateData.galleryImages = req.files.galleryImages.map((file) => file.path);
      }
    }

    event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Event removed",
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle event visibility
// @route   PATCH /api/v1/events/:id/visibility
// @access  Private/Admin
export const toggleVisibility = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    event.isVisible = !event.isVisible;
    await event.save();

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/v1/events/:id/featured
// @access  Private/Admin
export const toggleFeatured = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    event.isFeatured = !event.isFeatured;
    await event.save();

    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- PUBLIC CONTROLLERS ---

// @desc    Get all events (visible only)
// @route   GET /api/v1/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { category, status, featured } = req.query;
    const filter = { isVisible: true };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured) filter.isFeatured = featured === "true";

    const events = await Event.find(filter).sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/v1/events/id/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by slug
// @route   GET /api/v1/events/:slug
// @access  Public
export const getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug, isVisible: true });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured events
// @route   GET /api/v1/events/featured
// @access  Public
export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, isVisible: true }).limit(5);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming events
// @route   GET /api/v1/events/upcoming
// @access  Public
export const getUpcomingEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({
      status: { $regex: /^upcoming$/i },
      isVisible: true,
    })
      .sort({ eventDate: 1 })
      .limit(10)
      .lean();

    console.log("EVENTS_DEBUG: Found upcoming events count:", events.length);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Get Upcoming Events Error:", error);
    if (typeof next === "function") {
      return next(error);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
