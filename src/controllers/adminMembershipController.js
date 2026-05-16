import Membership from "../models/Membership.js";
import User from "../models/User.js";
import { checkExpiredMemberships } from "../utils/membershipUtils.js";
import { sendMembershipPurchaseEmail } from "../utils/emailUtils.js";



// @desc    Refund membership
// @route   PATCH /api/v1/admin/memberships/:id/refund
// @access  Private/Admin
export const refundMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      res.status(404);
      throw new Error("Membership not found");
    }

    membership.paymentStatus = "refunded";
    membership.membershipStatus = "cancelled";
    await membership.save();

    await User.findByIdAndUpdate(membership.user, {
      activeMembership: null,
      role: "user",
    });

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend confirmation email
// @route   POST /api/v1/admin/memberships/:id/resend-email
// @access  Private/Admin
export const resendConfirmationEmail = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id).populate("user");

    if (!membership) {
      res.status(404);
      throw new Error("Membership not found");
    }

    await sendMembershipPurchaseEmail(membership.user, membership);

    res.status(200).json({
      success: true,
      message: "Confirmation email resent",
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all memberships
// @route   GET /api/v1/admin/memberships
// @access  Private/Admin
export const getAllMemberships = async (req, res, next) => {
  try {
    await checkExpiredMemberships();
    const { status, type, search } = req.query;
    let query = {};

    if (status) query.membershipStatus = status;
    if (type) query.membershipType = type;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const memberships = await Membership.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update membership status
// @route   PATCH /api/v1/admin/memberships/:id/status
// @access  Private/Admin
export const updateMembershipStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      res.status(404);
      throw new Error("Membership not found");
    }

    membership.membershipStatus = status;
    await membership.save();

    // If cancelled, update user role back to user if they have no other active membership
    if (status === "cancelled" || status === "expired") {
        await User.findByIdAndUpdate(membership.user, {
            activeMembership: null,
            role: "user"
        });
    }

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Extend membership
// @route   PATCH /api/v1/admin/memberships/:id/extend
// @access  Private/Admin
export const extendMembership = async (req, res, next) => {
  try {
    const { days } = req.body;
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      res.status(404);
      throw new Error("Membership not found");
    }

    const currentExpiry = new Date(membership.expiryDate);
    currentExpiry.setDate(currentExpiry.getDate() + parseInt(days));
    
    membership.expiryDate = currentExpiry;
    membership.membershipStatus = "active";
    await membership.save();

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete membership
// @route   DELETE /api/v1/admin/memberships/:id
// @access  Private/Admin
export const deleteMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      res.status(404);
      throw new Error("Membership not found");
    }

    await User.findByIdAndUpdate(membership.user, {
        activeMembership: null,
        role: "user"
    });

    await membership.deleteOne();

    res.status(200).json({
      success: true,
      message: "Membership deleted",
    });
  } catch (error) {
    next(error);
  }
};
