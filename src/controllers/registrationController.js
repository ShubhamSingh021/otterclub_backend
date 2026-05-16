import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import { generateQR, getEventTicketQRData } from "../utils/qrUtils.js";
import { generateCertificate } from "../utils/pdfUtils.js";
import { sendRegistrationConfirmationEmail } from "../utils/emailUtils.js";

// @desc    Download participation certificate
// @route   GET /api/v1/registrations/certificate/:id
// @access  Private
export const downloadCertificate = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    if (registration.attendanceStatus !== 'attended') {
      return res.status(400).json({ success: false, message: "Certificate only available for attendees" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate_${registration.bookingId}.pdf`);

    generateCertificate(registration, registration.event, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get registration QR code (Ticket)
// @route   GET /api/v1/registrations/ticket-qr/:id
// @access  Private
export const getRegistrationQR = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Check ownership
    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to view this ticket" });
    }

    const qrData = getEventTicketQRData(registration, registration.event);
    const qrCode = await generateQR(qrData);

    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/v1/registrations
// @access  Private
export const createRegistration = async (req, res, next) => {
  try {
    const { eventId, paymentId, discountedPrice } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Generate unique booking ID
    const bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      userName: req.user.name,
      userEmail: req.user.email,
      bookingId,
      amountPaid: discountedPrice,
      paymentStatus: "completed",
      razorpayPaymentId: paymentId,
      discountedPrice,
    });

    // Send confirmation email
    await sendRegistrationConfirmationEmail(registration, event);

    res.status(201).json({
      success: true,
      message: "Event registered successfully!",
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations (Admin)
// @route   GET /api/v1/registrations/admin
// @access  Private/Admin
export const getRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find().populate("event").sort("-createdAt");
    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user registrations
// @route   GET /api/v1/registrations/my
// @access  Private
export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate("event")
      .sort("-createdAt");
    res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update registration status (Admin)
// @route   PATCH /api/v1/registrations/admin/:id
// @access  Private/Admin
export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const registration = await Registration.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete registration (Admin)
// @route   DELETE /api/v1/registrations/admin/:id
// @access  Private/Admin
export const deleteRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    await registration.deleteOne();

    res.status(200).json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend registration confirmation email
// @route   POST /api/v1/registrations/admin/resend/:id
// @access  Private/Admin
export const resendRegistrationEmail = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    await sendRegistrationConfirmationEmail(registration, registration.event);

    return res.status(200).json({
      success: true,
      message: "Confirmation email resent successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify registration QR and mark attendance
// @route   POST /api/v1/registrations/admin/verify-qr
// @access  Private/Admin
export const verifyRegistrationQR = async (req, res, next) => {
  try {
    const { registrationId } = req.body;
    
    const registration = await Registration.findById(registrationId).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Invalid ticket: Registration not found" });
    }

    if (registration.paymentStatus !== 'completed') {
      return res.status(400).json({ success: false, message: "Payment not completed for this ticket" });
    }

    if (registration.attendanceStatus === 'attended') {
      return res.status(400).json({ success: false, message: "Attendance already marked for this ticket" });
    }

    // Mark attendance
    registration.attendanceStatus = 'attended';
    await registration.save();

    return res.status(200).json({
      success: true,
      message: `Attendance marked for ${registration.userName}`,
      data: {
        userName: registration.userName,
        eventTitle: registration.event?.title,
        bookingId: registration.bookingId
      }
    });
  } catch (error) {
    next(error);
  }
};
