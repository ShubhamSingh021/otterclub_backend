import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
import { sendRegistrationConfirmationEmail } from "../utils/emailUtils.js";

// Initialize Razorpay
console.log("PAYMENT_DEBUG: Loading Razorpay keys...");
console.log(`PAYMENT_DEBUG: Key ID starts with: ${process.env.RAZORPAY_KEY_ID?.substring(0, 8)}...`);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log("PAYMENT_DEBUG: Razorpay instance initialized");

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payments/create-order
 * @access  Public (But checks for req.user if provided via middleware)
 */
export const createOrder = async (req, res) => {
  console.log("PAYMENT_DEBUG: createOrder body:", JSON.stringify(req.body, null, 2));
  try {
    const { eventId, registrationData, couponCode } = req.body;

    if (!eventId) {
      console.log("PAYMENT_DEBUG: Missing eventId");
      return res.status(400).json({ success: false, message: "Missing eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.log("PAYMENT_DEBUG: Event not found for ID:", eventId);
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    console.log("PAYMENT_DEBUG: Found event:", event.title, "Original Fee:", event.eventFee);

    // Check if already registered (ONLY APPROVED ONES)
    const existing = await Registration.findOne({
      event: eventId,
      email: registrationData.email.toLowerCase(),
      registrationStatus: "approved"
    });

    if (existing) {
      console.log("PAYMENT_DEBUG: User already registered:", registrationData.email);
      return res.status(400).json({ success: false, message: "You are already registered for this event" });
    }

    // DISCOUNT LOGIC: Check for active membership
    let finalFee = event.eventFee;
    let discountApplied = 0;

    if (req.user && req.user.activeMembership) {
      const membership = req.user.activeMembership;
      if (membership.membershipStatus === "active") {
        if (membership.membershipType === "ELITE") {
          discountApplied = 10;
          finalFee = Math.round(event.eventFee * 0.9);
        } else if (membership.membershipType === "PRO") {
          discountApplied = 20;
          finalFee = Math.round(event.eventFee * 0.8);
        }
      }
    }

    console.log(`PAYMENT_DEBUG: After Membership Discount Fee: ${finalFee} (Discount: ${discountApplied}%)`);

    // COUPON LOGIC
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found" });
      }
      if (!coupon.isActive) {
        return res.status(400).json({ success: false, message: "Coupon is not active" });
      }
      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }
      if (coupon.appliesTo !== "both" && coupon.appliesTo !== "event") {
        return res.status(400).json({ success: false, message: "Coupon is not valid for event registrations" });
      }
      if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
        const isMatch = coupon.applicableEvents.some(id => id.toString() === event._id.toString());
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Coupon is not applicable for this event" });
        }
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
      }
      if (req.user) {
        const userUsage = coupon.usersUsed.find(u => u.user.toString() === req.user._id.toString());
        if (userUsage && userUsage.count >= coupon.perUserLimit) {
          return res.status(400).json({ success: false, message: "You have reached your usage limit for this coupon" });
        }
      }

      // Calculate coupon discount
      if (coupon.discountType === "percentage") {
        couponDiscount = Math.round((finalFee * coupon.discountValue) / 100);
      } else {
        couponDiscount = Math.min(coupon.discountValue, finalFee);
      }
      finalFee = Math.max(0, finalFee - couponDiscount);
      appliedCoupon = coupon.code;
      console.log(`PAYMENT_DEBUG: After Coupon Discount Fee: ${finalFee} (Coupon: ${appliedCoupon}, Saved: ${couponDiscount})`);
    }

    // ZERO-FEE BYPASS CHECKOUT
    if (finalFee === 0) {
      console.log("PAYMENT_DEBUG: Final fee is 0, performing Free Bypass Registration...");
      const freeOrderId = `FREE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const payment = await Payment.create({
        event: event._id,
        user: req.user ? req.user._id : null,
        razorpayOrderId: freeOrderId,
        amount: 0,
        status: "paid",
        paymentDetails: {
          registrationData,
          discountApplied,
          originalFee: event.eventFee,
          membershipType: req.user && req.user.activeMembership ? req.user.activeMembership.membershipType : "NONE",
          couponCode: appliedCoupon,
          couponDiscount
        }
      });

      const registration = await Registration.create({
        ...registrationData,
        user: req.user ? req.user._id : null,
        event: event._id,
        bookingId,
        razorpayOrderId: freeOrderId,
        paymentStatus: "paid",
        registrationStatus: "approved",
        originalPrice: event.eventFee,
        discountedPrice: 0,
        membershipType: req.user && req.user.activeMembership ? req.user.activeMembership.membershipType : "NONE"
      });

      payment.registration = registration._id;
      await payment.save();

      // Increment event participants
      await Event.findByIdAndUpdate(event._id, { $inc: { currentParticipants: 1 } });

      // Track Coupon usage if applied
      if (appliedCoupon) {
        const coupon = await Coupon.findOne({ code: appliedCoupon });
        if (coupon) {
          coupon.usedCount += 1;
          if (req.user) {
            const userIndex = coupon.usersUsed.findIndex(u => u.user.toString() === req.user._id.toString());
            if (userIndex > -1) {
              coupon.usersUsed[userIndex].count += 1;
            } else {
              coupon.usersUsed.push({ user: req.user._id, count: 1 });
            }
          }
          await coupon.save();
        }
      }

      // Create Success Notification
      if (req.user) {
        await Notification.create({
          userId: req.user._id,
          title: "Event Registered!",
          message: `Congratulations! You are successfully registered for the event: ${event.title}`,
          type: "event",
          link: "/dashboard"
        });
      }

      // Send confirmation email
      try {
        await sendRegistrationConfirmationEmail(registration, event);
      } catch (emailError) {
        console.error(`PAYMENT_WARN: Email failed but registration succeeded:`, emailError.message);
      }

      return res.status(200).json({
        success: true,
        isFree: true,
        bookingId
      });
    }

    const amount = finalFee * 100; // Amount in paise
    console.log("PAYMENT_DEBUG: Creating Razorpay order for amount:", amount);

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("PAYMENT_DEBUG: Razorpay order created:", order.id);
    } catch (rzpError) {
      console.error("PAYMENT_DEBUG: Razorpay API Error:", rzpError);
      return res.status(500).json({ success: false, message: "Razorpay Error: " + rzpError.message });
    }

    // Create payment record and store the registration form data temporarily
    await Payment.create({
      event: event._id,
      user: req.user ? req.user._id : null,
      razorpayOrderId: order.id,
      amount: finalFee,
      status: "pending",
      paymentDetails: { 
        registrationData,
        discountApplied,
        originalFee: event.eventFee,
        membershipType: req.user && req.user.activeMembership ? req.user.activeMembership.membershipType : "NONE",
        couponCode: appliedCoupon,
        couponDiscount
      }
    });
    console.log("PAYMENT_DEBUG: Payment record created");

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("PAYMENT_DEBUG: General Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify Razorpay Payment
 * @route   POST /api/v1/payments/verify
 * @access  Public
 */
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      registrationId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      console.log("PAYMENT_DEBUG: Signature authentic. Processing verification...");
      
      // Find the payment record
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!payment) {
        console.error("PAYMENT_DEBUG: Payment record not found for order:", razorpay_order_id);
        return res.status(404).json({ success: false, message: "Payment record not found" });
      }

      // 1. DUPLICATE PROTECTION: Check if registration already exists for this order
      const existingRegistration = await Registration.findOne({ razorpayOrderId: razorpay_order_id });
      if (existingRegistration && existingRegistration.paymentStatus === 'paid') {
        console.log("PAYMENT_DEBUG: Registration already processed for this order.");
        return res.status(200).json({ success: true, message: "Payment already verified" });
      }

      // Update Payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "paid";
      await payment.save();
      console.log("PAYMENT_DEBUG: Payment record updated to paid");

      // NOW Create the Registration record
      const registrationData = payment.paymentDetails.registrationData;
      
      // Generate unique booking ID
      const bookingId = `OC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      console.log("PAYMENT_DEBUG: Creating registration for email:", registrationData.email, "BookingId:", bookingId);
      const registration = await Registration.create({
        ...registrationData,
        user: payment.user, // Link the user!
        event: payment.event,
        bookingId, // Add booking ID!
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid",
        registrationStatus: "approved",
        originalPrice: payment.paymentDetails.originalFee,
        discountedPrice: payment.amount,
        membershipType: payment.paymentDetails.membershipType
      });
      console.log("PAYMENT_DEBUG: Registration created:", registration._id);

      // Link registration back to payment
      payment.registration = registration._id;
      await payment.save();

      // Increment event participants
      const event = await Event.findByIdAndUpdate(payment.event, {
        $inc: { currentParticipants: 1 }
      });
      console.log("PAYMENT_DEBUG: Event participant count incremented");

      // Track Coupon usage if applied
      if (payment.paymentDetails && payment.paymentDetails.couponCode) {
        const coupon = await Coupon.findOne({ code: payment.paymentDetails.couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          if (payment.user) {
            const userIndex = coupon.usersUsed.findIndex(u => u.user.toString() === payment.user.toString());
            if (userIndex > -1) {
              coupon.usersUsed[userIndex].count += 1;
            } else {
              coupon.usersUsed.push({ user: payment.user, count: 1 });
            }
          }
          await coupon.save();
        }
      }

      // Create Success Notification
      if (payment.user) {
        await Notification.create({
          userId: payment.user,
          title: "Event Registered!",
          message: `Congratulations! You are successfully registered for the event: ${event.title}`,
          type: "event",
          link: "/dashboard"
        });
      }

      // Send email (wrapped in try-catch so email sandbox restrictions don't block registration success)
      try {
        await sendRegistrationConfirmationEmail(registration, event);
      } catch (emailError) {
        console.error(`PAYMENT_WARN: Email failed but registration succeeded:`, emailError.message);
      }

      res.status(200).json({ success: true, message: "Payment verified and registration complete" });
    } else {
      console.error("PAYMENT_DEBUG: Invalid signature verification failed");
      
      // Update Payment record to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/v1/payments/admin/all
 * @access  Private/Admin
 */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("registration", "fullName email phone")
      .populate("event", "title")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
