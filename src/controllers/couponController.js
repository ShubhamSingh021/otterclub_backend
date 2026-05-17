import Coupon from "../models/Coupon.js";
import Payment from "../models/Payment.js";
import Registration from "../models/Registration.js";
import Membership from "../models/Membership.js";

/**
 * @desc    Validate and calculate coupon discount
 * @route   POST /api/v1/coupons/validate
 * @access  Protected (User)
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, appliesTo, itemId, originalPrice } = req.body;
    const userId = req.user?._id;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is not active" });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    // Check compatibility
    if (coupon.appliesTo !== "both" && coupon.appliesTo !== appliesTo) {
      return res.status(400).json({ success: false, message: `Coupon is only valid for ${coupon.appliesTo} purchases` });
    }

    // Check item restriction rules
    if (appliesTo === "event" && itemId) {
      if (coupon.applicableEvents && coupon.applicableEvents.length > 0) {
        const isMatch = coupon.applicableEvents.some((id) => id.toString() === itemId.toString());
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Coupon is not applicable for this event" });
        }
      }
    }

    if (appliesTo === "membership" && itemId) {
      if (coupon.applicablePlans && coupon.applicablePlans.length > 0) {
        const isMatch = coupon.applicablePlans.some(
          (plan) => plan.toUpperCase() === itemId.toUpperCase()
        );
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Coupon is not applicable for this membership plan" });
        }
      }
    }

    // Check total usage limits
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit has been reached" });
    }

    // Check per-user limit
    if (userId) {
      const userUsage = coupon.usersUsed.find((u) => u.user.toString() === userId.toString());
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return res.status(400).json({ success: false, message: "You have reached your limit for this coupon" });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    const basePrice = Number(originalPrice) || 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
    } else {
      discountAmount = Math.min(coupon.discountValue, basePrice);
    }

    const finalPrice = Math.max(0, basePrice - discountAmount);

    return res.status(200).json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
      finalPrice,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/v1/coupons/admin/list
 * @access  Private (Admin)
 */
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new coupon (Admin)
 * @route   POST /api/v1/coupons/admin
 * @access  Private (Admin)
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      appliesTo,
      applicableEvents,
      applicablePlans,
      usageLimit,
      perUserLimit,
      expiryDate,
      isActive,
    } = req.body;

    if (!code || !description || !discountType || discountValue === undefined || !expiryDate) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      appliesTo,
      applicableEvents: applicableEvents || [],
      applicablePlans: applicablePlans || [],
      usageLimit: usageLimit === "" ? null : usageLimit,
      perUserLimit: perUserLimit || 1,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({ success: true, data: newCoupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing coupon (Admin)
 * @route   PUT /api/v1/coupons/admin/:id
 * @access  Private (Admin)
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discountValue,
      appliesTo,
      applicableEvents,
      applicablePlans,
      usageLimit,
      perUserLimit,
      expiryDate,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (code && code.toUpperCase() !== coupon.code) {
      const existing = await Coupon.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Coupon code already exists" });
      }
      coupon.code = code.toUpperCase();
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (appliesTo !== undefined) coupon.appliesTo = appliesTo;
    if (applicableEvents !== undefined) coupon.applicableEvents = applicableEvents;
    if (applicablePlans !== undefined) coupon.applicablePlans = applicablePlans;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit === "" ? null : usageLimit;
    if (perUserLimit !== undefined) coupon.perUserLimit = perUserLimit;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    const updated = await coupon.save();
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a coupon (Admin)
 * @route   DELETE /api/v1/coupons/admin/:id
 * @access  Private (Admin)
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    return res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggle coupon active status (Admin)
 * @route   PATCH /api/v1/coupons/admin/:id/toggle
 * @access  Private (Admin)
 */
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    const updated = await coupon.save();

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get coupon system statistics (Admin)
 * @route   GET /api/v1/coupons/admin/stats
 * @access  Private (Admin)
 */
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    
    // Sum usedCount across all coupons
    const coupons = await Coupon.find();
    const totalUsage = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        totalUsage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
