import jwt from "jsonwebtoken";
import env from "../config/env.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import Registration from "../models/Registration.js";

// @desc    Get dashboard analytics
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Basic Stats
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalMembers = await User.countDocuments({ role: 'member' });
    
    const membershipStats = await Membership.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$membershipType', count: { $sum: 1 }, revenue: { $sum: '$price' } } }
    ]);

    const eventStats = await Registration.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$amountPaid' } } }
    ]);

    const totalRevenue = (membershipStats.reduce((acc, curr) => acc + curr.revenue, 0)) + 
                         (eventStats[0]?.revenue || 0);

    // 2. Revenue Over Time (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Membership.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 3. Registration Trends
    const eventTrends = await Registration.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMembers,
          totalRevenue,
          totalRegistrations: eventStats[0]?.count || 0
        },
        membershipDistribution: membershipStats,
        monthlyRevenue,
        eventTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth admin & get token
// @route   POST /api/v1/admin/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admin email
    const admin = await Admin.findOne({ email }).select("+password");

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/v1/admin/profile
// @access  Private
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id);

    if (admin) {
      res.json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } else {
      res.status(404);
      throw new Error("Admin not found");
    }
  } catch (error) {
    next(error);
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
};
