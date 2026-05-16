import User from "../models/User.js";
import Membership from "../models/Membership.js";
import Registration from "../models/Registration.js";
import { generateQR, getMembershipQRData } from "../utils/qrUtils.js";

// @desc    Get all payments for a user (Membership + Event)
// @route   GET /api/v1/user/payments
// @access  Private
export const getUserPayments = async (req, res, next) => {
  try {
    // 1. Get Membership Payments
    const membershipPayments = await Membership.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // 2. Get Event Registrations
    const eventRegistrations = await Registration.find({ user: req.user._id }).populate("event").sort({ createdAt: -1 });

    // Format them into a unified list
    const combinedHistory = [
      ...membershipPayments.map(m => ({
        id: m._id,
        type: "Membership",
        title: `${m.membershipType} Membership`,
        amount: m.price,
        date: m.createdAt,
        status: m.paymentStatus,
        transactionId: m.razorpayPaymentId,
        details: m.benefits.join(", ")
      })),
      ...eventRegistrations.map(r => ({
        id: r._id,
        type: "Event",
        title: r.event ? r.event.title : "Unknown Event",
        amount: r.amountPaid || 0,
        date: r.createdAt,
        status: r.paymentStatus,
        transactionId: r.razorpayPaymentId,
        details: `Booking ID: ${r.bookingId}`
      }))
    ];

    // Sort by date descending
    combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: combinedHistory.length,
      data: combinedHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get membership QR code
// @route   GET /api/v1/user/membership-qr
// @access  Private
export const getMembershipQR = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("activeMembership");
    if (!user || !user.activeMembership) {
      return res.status(404).json({ success: false, message: "No active membership found" });
    }

    const qrData = getMembershipQRData(user, user.activeMembership);
    const qrCode = await generateQR(qrData);

    res.status(200).json({
      success: true,
      data: qrCode
    });
  } catch (error) {
    next(error);
  }
};
