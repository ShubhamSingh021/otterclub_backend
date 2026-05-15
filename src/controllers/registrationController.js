import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// @desc    Register for an event
// @route   POST /api/v1/registrations
// @access  Public
export const createRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check capacity
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: "Registration Closed: Event is full" });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
      email: req.body.email.toLowerCase(),
    });

    if (existingRegistration) {
      return res.status(400).json({ success: false, message: "You are already registered for this event" });
    }

    const registration = await Registration.create({
      ...req.body,
      event: eventId,
    });

    // Increment current participants
    event.currentParticipants += 1;
    await event.save();

    return res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Create Registration Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registrations
// @route   GET /api/v1/registrations/admin
// @access  Private/Admin
export const getRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.query;
    const filter = {};
    if (eventId) filter.event = eventId;

    const registrations = await Registration.find(filter)
      .populate("event", "title eventDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update registration status
// @route   PATCH /api/v1/registrations/admin/:id
// @access  Private/Admin
export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationStatus, paymentStatus } = req.body;
    
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    if (registrationStatus) registration.registrationStatus = registrationStatus;
    if (paymentStatus) registration.paymentStatus = paymentStatus;

    // If cancelled, decrement event capacity
    if (registrationStatus === "cancelled" && registration.registrationStatus !== "cancelled") {
        const event = await Event.findById(registration.event);
        if (event) {
            event.currentParticipants = Math.max(0, event.currentParticipants - 1);
            await event.save();
        }
    }

    await registration.save();

    return res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete registration
// @route   DELETE /api/v1/registrations/admin/:id
// @access  Private/Admin
export const deleteRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Decrement event capacity before deletion if not already cancelled
    if (registration.registrationStatus !== "cancelled") {
        const event = await Event.findById(registration.event);
        if (event) {
            event.currentParticipants = Math.max(0, event.currentParticipants - 1);
            await event.save();
        }
    }

    await registration.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Registration removed",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
