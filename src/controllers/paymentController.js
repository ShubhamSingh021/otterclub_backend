import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/v1/payments/create-order
 * @access  Public (Triggered during registration)
 */
export const createOrder = async (req, res) => {
  try {
    const { registrationId } = req.body;

    const registration = await Registration.findById(registrationId).populate("event");
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    const event = registration.event;
    const amount = event.eventFee * 100; // Amount in paise

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${registration._id}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to registration
    registration.razorpayOrderId = order.id;
    await registration.save();

    // Create payment record
    await Payment.create({
      registration: registration._id,
      event: event._id,
      razorpayOrderId: order.id,
      amount: event.eventFee,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
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
      if (payment) {
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = "paid";
        await payment.save();
      }

      // Update Registration record
      const registration = await Registration.findById(registrationId);
      if (registration) {
        registration.paymentStatus = "paid";
        registration.registrationStatus = "approved";
        await registration.save();

        // Increment event participants
        await Event.findByIdAndUpdate(registration.event, {
          $inc: { currentParticipants: 1 }
        });
      }

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
