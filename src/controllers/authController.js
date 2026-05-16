import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import { checkExpiredMemberships } from "../utils/membershipUtils.js";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    await checkExpiredMemberships();
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password").populate("activeMembership");

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          activeMembership: user.activeMembership,
          token: generateToken(user._id),
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

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    await checkExpiredMemberships();
    const user = await User.findById(req.user._id).populate("activeMembership");

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    // Check if user exists in either collection
    let user = await User.findById(req.user._id);
    let is_admin = false;
    
    if (!user) {
      user = await Admin.findById(req.user._id);
      is_admin = true;
    }

    if (user) {
      // Update fields
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      
      if (req.file) {
        user.avatar = req.file.path; // Cloudinary URL
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      
      // Fetch fresh data with population
      let populatedUser;
      if (is_admin) {
        populatedUser = await Admin.findById(updatedUser._id);
      } else {
        populatedUser = await User.findById(updatedUser._id).populate("activeMembership");
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          _id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          phone: populatedUser.phone,
          role: populatedUser.role,
          avatar: populatedUser.avatar,
          activeMembership: populatedUser.activeMembership || null,
          token: generateToken(populatedUser._id),
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    next(error);
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });
};
