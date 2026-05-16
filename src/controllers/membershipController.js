import Razorpay from "razorpay";
import env from "../config/env.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import crypto from "crypto";
import { 
  sendMembershipPurchaseEmail, 
  sendMembershipUpgradeEmail, 
  sendMembershipRenewEmail 
} from "../utils/emailUtils.js";

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

// @desc    Create a membership order (including upgrades and renewals)
// @route   POST /api/v1/membership/create-order
// @access  Private
export const createMembershipOrder = async (req, res, next) => {
  try {
    const { planType, isUpgrade, isRenewal } = req.body;

    if (!PLANS[planType]) {
      res.status(400);
      throw new Error("Invalid membership plan");
    }

    const plan = PLANS[planType];
    const user = await User.findById(req.user._id).populate("activeMembership");
    const activeMembership = user.activeMembership;

    let finalAmount = plan.price;

    if (isUpgrade) {
      if (!activeMembership) {
        res.status(400);
        throw new Error("No active membership found to upgrade");
      }

      // Validate upgrade path
      const planHierarchy = ["BASIC", "ELITE", "PRO"];
      const currentLevel = planHierarchy.indexOf(activeMembership.membershipType);
      const targetLevel = planHierarchy.indexOf(planType);

      if (targetLevel <= currentLevel) {
        res.status(400);
        throw new Error("You can only upgrade to a higher plan");
      }

      // Calculate difference
      finalAmount = plan.price - activeMembership.price;
      if (finalAmount < 0) finalAmount = 0;
    } else if (isRenewal) {
      if (!activeMembership && user.role !== "user") {
        // Find last expired membership if any
        const lastMembership = await Membership.findOne({ user: user._id }).sort({ createdAt: -1 });
        if (!lastMembership) {
           // Fresh purchase
        }
      }
    } else {
      // Normal purchase - check if already has active membership
      if (activeMembership && activeMembership.membershipStatus === "active") {
        res.status(400);
        throw new Error(`You already have an active ${activeMembership.membershipType} membership`);
      }
    }

    const options = {
      amount: Math.round(finalAmount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `membership_${req.user._id}_${Date.now()}`,
      notes: {
        planType,
        isUpgrade: isUpgrade ? "yes" : "no",
        isRenewal: isRenewal ? "yes" : "no",
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan: {
        ...plan,
        finalPrice: finalAmount,
      },
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, isUpgrade, isRenewal } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const plan = PLANS[planType];
      const user = await User.findById(req.user._id).populate("activeMembership");
      
      let membership;

      if (isUpgrade && user.activeMembership) {
        membership = user.activeMembership;
        
        // Save to upgrade history
        membership.upgradeHistory.push({
          from: membership.membershipType,
          to: planType,
          price: plan.price - membership.price,
        });

        membership.membershipType = planType;
        membership.price = plan.price;
        membership.benefits = plan.benefits;
        membership.razorpayPaymentId = razorpay_payment_id;
        
        await membership.save();
        await sendMembershipUpgradeEmail(user, membership);
      } else if (isRenewal && user.activeMembership) {
        membership = user.activeMembership;
        
        // Extend expiry by 30 days
        const currentExpiry = new Date(membership.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + 30);
        membership.expiryDate = currentExpiry;
        membership.razorpayPaymentId = razorpay_payment_id;
        membership.membershipStatus = "active";
        
        await membership.save();
        await sendMembershipRenewEmail(user, membership);
      } else {
        // Create new membership record
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        membership = await Membership.create({
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

        await sendMembershipPurchaseEmail(user, membership);
      }

      res.status(200).json({
        success: true,
        message: isUpgrade ? "Membership upgraded!" : isRenewal ? "Membership renewed!" : "Membership activated!",
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
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get membership payment history
// @route   GET /api/v1/membership/history
// @access  Private
export const getMembershipHistory = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: memberships,
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
    data: PLANS,
  });
};

