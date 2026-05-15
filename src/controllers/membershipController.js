import Razorpay from "razorpay";
import env from "../config/env.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

const PLANS = {
  BASIC: {
    name: "BASIC",
    price: 299,
    benefits: ["Access to regular events", "Community access", "Basic support"],
  },
  ELITE: {
    name: "ELITE",
    price: 799,
    benefits: [
      "Everything in Basic",
      "Priority event registration",
      "10% discount on paid events",
      "Premium support",
      "Elite badge",
    ],
  },
  PRO: {
    name: "PRO",
    price: 1499,
    benefits: [
      "Everything in Elite",
      "20% event discount",
      "Exclusive members-only events",
      "Pro badge",
      "VIP support",
      "Early access booking",
    ],
  },
};

// @desc    Create a membership order
// @route   POST /api/v1/membership/create-order
// @access  Private
export const createMembershipOrder = async (req, res, next) => {
  try {
    const { planType } = req.body;

    if (!PLANS[planType]) {
      res.status(400);
      throw new Error("Invalid membership plan");
    }

    const plan = PLANS[planType];

    // Check if user already has an active membership of the same type
    const existingMembership = await Membership.findOne({
      user: req.user._id,
      membershipStatus: "active",
    });

    if (existingMembership && existingMembership.membershipType === planType) {
       // Check if it's nearing expiry for renewal, but for now just prevent duplicates
       res.status(400);
       throw new Error("You already have an active " + planType + " membership");
    }

    const options = {
      amount: plan.price * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `membership_${req.user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify membership payment
// @route   POST /api/v1/membership/verify-payment
// @access  Private
export const verifyMembershipPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const plan = PLANS[planType];
      
      // Calculate expiry date (1 month from now)
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      // Create membership record
      const membership = await Membership.create({
        user: req.user._id,
        userName: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        membershipType: planType,
        price: plan.price,
        startDate,
        expiryDate,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid",
        membershipStatus: "active",
        benefits: plan.benefits,
      });

      // Update user
      await User.findByIdAndUpdate(req.user._id, {
        activeMembership: membership._id,
        role: "member",
      });

      res.status(200).json({
        success: true,
        message: "Membership activated successfully",
        data: membership,
      });
    } else {
      res.status(400);
      throw new Error("Invalid payment signature");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user membership
// @route   GET /api/v1/membership/my
// @access  Private
export const getMyMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findOne({
      user: req.user._id,
      membershipStatus: "active",
    });

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plans
// @route   GET /api/v1/membership/plans
// @access  Public
export const getPlans = async (req, res, next) => {
    res.status(200).json({
        success: true,
        data: PLANS
    });
};
