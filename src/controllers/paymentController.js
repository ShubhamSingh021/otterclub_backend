import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

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
 * @access  Public (Triggered during registration)
 */
export const createOrder = async (req, res) => {
  console.log("PAYMENT_DEBUG: createOrder body:", JSON.stringify(req.body, null, 2));
  try {
    const { eventId, registrationData } = req.body;

    if (!eventId) {
      console.log("PAYMENT_DEBUG: Missing eventId");
      return res.status(400).json({ success: false, message: "Missing eventId" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      console.log("PAYMENT_DEBUG: Event not found for ID:", eventId);
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    console.log("PAYMENT_DEBUG: Found event:", event.title, "Fee:", event.eventFee);

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

    const amount = event.eventFee * 100; // Amount in paise
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
      razorpayOrderId: order.id,
      amount: event.eventFee,
      status: "pending",
      paymentDetails: { registrationData } // Store form data here until payment is verified
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
      // Update Payment record
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment record not found" });
      }

      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = "paid";
      await payment.save();

      // NOW Create the Registration record
      const registrationData = payment.paymentDetails.registrationData;
      
      const registration = await Registration.create({
        ...registrationData,
        event: payment.event,
        razorpayOrderId: razorpay_order_id,
        paymentStatus: "paid",
        registrationStatus: "approved"
      });

      // Link registration back to payment
      payment.registration = registration._id;
      await payment.save();

      // Increment event participants
      await Event.findByIdAndUpdate(payment.event, {
        $inc: { currentParticipants: 1 }
      });

      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      // Handle failed verification
      await Registration.findByIdAndUpdate(registrationId, {
        paymentStatus: "failed"
      });
      
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
