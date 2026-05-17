import Razorpay from "razorpay";
import env from "../config/env.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
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

// @desc    Create a membership order (including upgrades and renewals)
// @route   POST /api/v1/membership/create-order
// @access  Private
export const createMembershipOrder = async (req, res, next) => {
  try {
    const { planType, isUpgrade, isRenewal, couponCode } = req.body;
    console.log("ORDER_CREATE: Received request for plan:", planType);
    const plan = await MembershipPlan.findOne({ name: planType, active: true });

    if (!plan) {
      console.warn("ORDER_CREATE_WARN: Plan not found or inactive:", planType);
      res.status(400);
      throw new Error("Invalid or inactive membership plan");
    }

    const user = await User.findById(req.user._id).populate("activeMembership");
    
    if (!user) {
      console.log("ORDER_CREATE_INFO: User not found in User collection (likely an Admin)");
      return res.status(400).json({ 
        success: false, 
        message: "Only normal users can purchase memberships. If you are an admin, please use a user account for testing." 
      });
    }

    console.log("ORDER_CREATE: User found, calculating amount...");
    const activeMembership = user.activeMembership;

    let finalAmount = plan.price;

    if (isUpgrade) {
      if (!activeMembership) {
        res.status(400);
        throw new Error("No active membership found to upgrade");
      }

      // Check if target plan is actually an upgrade
      if (plan.price <= activeMembership.price) {
        res.status(400);
        throw new Error("Target plan must have a higher price for an upgrade");
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

    // COUPON LOGIC
    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) {
        res.status(404);
        throw new Error("Coupon not found");
      }
      if (!coupon.isActive) {
        res.status(400);
        throw new Error("Coupon is not active");
      }
      if (new Date(coupon.expiryDate) < new Date()) {
        res.status(400);
        throw new Error("Coupon has expired");
      }
      if (coupon.appliesTo !== "both" && coupon.appliesTo !== "membership") {
        res.status(400);
        throw new Error("Coupon is not valid for memberships");
      }
      if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
        const isMatch = coupon.applicablePlans.some(p => p.toUpperCase() === planType.toUpperCase());
        if (!isMatch) {
          res.status(400);
          throw new Error("Coupon is not applicable for this membership plan");
        }
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error("Coupon usage limit has been reached");
      }
      const userUsage = coupon.usersUsed.find(u => u.user.toString() === req.user._id.toString());
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        res.status(400);
        throw new Error("You have reached your usage limit for this coupon");
      }

      // Calculate coupon discount
      if (coupon.discountType === "percentage") {
        couponDiscount = Math.round((finalAmount * coupon.discountValue) / 100);
      } else {
        couponDiscount = Math.min(coupon.discountValue, finalAmount);
      }
      finalAmount = Math.max(0, finalAmount - couponDiscount);
      appliedCoupon = coupon.code;
      console.log(`ORDER_CREATE: Applied coupon ${appliedCoupon}, new final amount is ${finalAmount}`);
    }

    // ZERO-COST BYPASS ACTIVATION
    if (finalAmount === 0) {
      console.log("MEMBERSHIP_ORDER: Free coupon bypass activation...");
      let membership;
      const freeOrderId = `FREE_MS_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const freePaymentId = `PAY_FREE_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      if (isUpgrade && user.activeMembership) {
        membership = user.activeMembership;
        membership.upgradeHistory.push({
          from: membership.membershipType,
          to: planType,
          price: plan.price - membership.price,
        });

        membership.membershipType = planType;
        membership.price = plan.price;
        membership.benefits = plan.benefits;
        membership.razorpayPaymentId = freePaymentId;
        
        await membership.save();
        try {
          await sendMembershipUpgradeEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Upgrade email failed:`, emailError.message);
        }
      } else if (isRenewal && user.activeMembership) {
        membership = user.activeMembership;
        const currentExpiry = new Date(membership.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + (plan.validityDays || 30));
        membership.expiryDate = currentExpiry;
        membership.razorpayPaymentId = freePaymentId;
        membership.membershipStatus = "active";
        
        await membership.save();
        try {
          await sendMembershipRenewEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Renewal email failed:`, emailError.message);
        }
      } else {
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.validityDays || 30));

        membership = await Membership.create({
          user: req.user._id,
          userName: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          membershipType: planType,
          price: plan.price,
          startDate,
          expiryDate,
          razorpayOrderId: freeOrderId,
          razorpayPaymentId: freePaymentId,
          paymentStatus: "paid",
          membershipStatus: "active",
          benefits: plan.benefits,
        });

        await User.findByIdAndUpdate(req.user._id, {
          activeMembership: membership._id,
          role: "member",
        });

        try {
          await sendMembershipPurchaseEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Purchase email failed:`, emailError.message);
        }
      }

      // Track Coupon usage
      if (appliedCoupon) {
        const coupon = await Coupon.findOne({ code: appliedCoupon });
        if (coupon) {
          coupon.usedCount += 1;
          const userIndex = coupon.usersUsed.findIndex(u => u.user.toString() === req.user._id.toString());
          if (userIndex > -1) {
            coupon.usersUsed[userIndex].count += 1;
          } else {
            coupon.usersUsed.push({ user: req.user._id, count: 1 });
          }
          await coupon.save();
        }
      }

      // Send Success Notification
      await Notification.create({
        userId: req.user._id,
        title: "Membership Active!",
        message: `Welcome to Otter ${planType}! Your membership has been activated successfully.`,
        type: "membership",
        link: "/dashboard"
      });

      return res.status(200).json({
        success: true,
        isFree: true,
        data: membership,
      });
    }

    const options = {
      amount: Math.round(finalAmount * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: `ms_${req.user._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        planType,
        isUpgrade: isUpgrade ? "yes" : "no",
        isRenewal: isRenewal ? "yes" : "no",
        couponCode: appliedCoupon || "",
        couponDiscount: couponDiscount.toString()
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      plan: {
        name: plan.name,
        price: plan.price,
        benefits: plan.benefits,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, isUpgrade, isRenewal, couponCode } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", env.razorpayKeySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const plan = await MembershipPlan.findOne({ name: planType });
      if (!plan) {
        res.status(404);
        throw new Error("Plan not found");
      }

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
        try {
          await sendMembershipUpgradeEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Upgrade email failed:`, emailError.message);
        }
      } else if (isRenewal && user.activeMembership) {
        membership = user.activeMembership;
        
        // Extend expiry by plan's validity days
        const currentExpiry = new Date(membership.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + (plan.validityDays || 30));
        membership.expiryDate = currentExpiry;
        membership.razorpayPaymentId = razorpay_payment_id;
        membership.membershipStatus = "active";
        
        await membership.save();
        try {
          await sendMembershipRenewEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Renewal email failed:`, emailError.message);
        }
      } else {
        // Create new membership record
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.validityDays || 30));

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

        try {
          await sendMembershipPurchaseEmail(user, membership);
        } catch (emailError) {
          console.error(`MEMBERSHIP_WARN: Purchase email failed:`, emailError.message);
        }
      }

      // Track Coupon usage if applied
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        if (coupon) {
          coupon.usedCount += 1;
          const userIndex = coupon.usersUsed.findIndex(u => u.user.toString() === req.user._id.toString());
          if (userIndex > -1) {
            coupon.usersUsed[userIndex].count += 1;
          } else {
            coupon.usersUsed.push({ user: req.user._id, count: 1 });
          }
          await coupon.save();
        }
      }

      // Send Success Notification
      await Notification.create({
        userId: req.user._id,
        title: "Membership Active!",
        message: `Welcome to Otter ${planType}! Your membership has been activated successfully.`,
        type: "membership",
        link: "/dashboard"
      });

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
  try {
    const plans = await MembershipPlan.find({ active: true }).sort({ displayOrder: 1 });
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

