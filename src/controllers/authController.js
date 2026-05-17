import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import env from "../config/env.js";
import { sendPasswordResetEmail } from "../utils/emailUtils.js";

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists in User collection
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Check if user exists in Admin collection
    let admin = await Admin.findOne({ email });
    if (admin) {
      return res.status(400).json({ success: false, message: "Email already registered as admin" });
    }

    user = await User.create({
      name,
      email,
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user/admin
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, isAdmin } = req.body;

    let user;
    if (isAdmin) {
      user = await Admin.findOne({ email }).select("+password");
    } else {
      user = await User.findOne({ email }).select("+password").populate("activeMembership");
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      activeMembership: user.activeMembership || null,
    };

    res.status(200).json({
      success: true,
      data: userData,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is already populated by protect middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    console.log("PROFILE_UPDATE: Received request for user ID:", req.user._id);
    console.log("PROFILE_UPDATE: Body:", { ...req.body, password: req.body.password ? "********" : undefined });
    console.log("PROFILE_UPDATE: File:", req.file ? "File present" : "No file");

    // Check if user exists in either collection
    let user = await User.findById(req.user._id);
    let is_admin = false;
    
    if (!user) {
      user = await Admin.findById(req.user._id);
      is_admin = true;
    }

    if (user) {
      console.log("PROFILE_UPDATE: Found user in collection:", is_admin ? "Admin" : "User");
      
      // Update fields with logging
      if (req.body.name) {
        console.log(`PROFILE_UPDATE: Changing name from "${user.name}" to "${req.body.name}"`);
        user.name = req.body.name;
      }
      
      if (req.body.phone !== undefined) {
        console.log(`PROFILE_UPDATE: Changing phone from "${user.phone}" to "${req.body.phone}"`);
        user.phone = req.body.phone;
      }
      
      if (req.file) {
        console.log("PROFILE_UPDATE: Setting new avatar from file:", req.file.path);
        user.avatar = req.file.path; // Cloudinary URL
      } else if (req.body.avatar) {
        console.log("PROFILE_UPDATE: Setting avatar from body:", req.body.avatar);
        user.avatar = req.body.avatar;
      }

      if (req.body.password) {
        console.log("PROFILE_UPDATE: Updating password");
        user.password = req.body.password;
      }

      // Save changes
      console.log("PROFILE_UPDATE: Saving user...");
      try {
        await user.save();
        console.log("PROFILE_UPDATE: User saved successfully");
      } catch (saveError) {
        console.error("PROFILE_UPDATE_SAVE_ERROR:", saveError);
        return res.status(400).json({ success: false, message: saveError.message });
      }

      // Re-fetch populated user (Handle both User and Admin)
      let populatedUser;
      if (is_admin) {
        populatedUser = await Admin.findById(user._id).select("-password");
      } else {
        populatedUser = await User.findById(user._id).select("-password").populate("activeMembership");
      }

      if (!populatedUser) {
        console.error("PROFILE_UPDATE_ERROR: User not found after update");
        return res.status(404).json({ success: false, message: "User not found after update" });
      }

      // Clean data for response
      const userData = {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        phone: populatedUser.phone,
        role: populatedUser.role,
        avatar: populatedUser.avatar,
        activeMembership: populatedUser.activeMembership || null,
      };

      console.log("PROFILE_UPDATE_SUCCESS: Returning updated user data");
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: userData,
        token: generateToken(populatedUser._id),
      });
    } else {
      console.warn("PROFILE_UPDATE_WARN: User not found in either collection");
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    console.log(`[FORGOT_PASSWORD_REQUEST] Email: ${req.body.email}`);
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user with that email" });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Determine the client origin dynamically based on request headers or fallback to config
    let origin = req.get("origin") || req.get("referer");
    
    // Clean origin (remove trailing slash and path components)
    if (origin) {
      origin = origin.replace(/\/$/, "");
      try {
        const originUrl = new URL(origin);
        origin = originUrl.origin;
      } catch (e) {
        // Fallback to simple string if URL parsing fails
      }
    }

    const allowedOrigins = env.clientOrigin || [];
    let clientOrigin = allowedOrigins[0] || "http://localhost:5173";

    if (origin && allowedOrigins.includes(origin)) {
      clientOrigin = origin;
    } else {
      // Find the first Vercel/production origin in the list, or fallback to the first allowed origin
      const prodOrigin = allowedOrigins.find(o => !o.includes("localhost") && !o.includes("127.0.0.1"));
      if (prodOrigin) {
        clientOrigin = prodOrigin;
      }
    }

    // Create reset URL (Frontend URL)
    const resetUrl = `${clientOrigin}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user, resetUrl);
      
      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error("[FORGOT_PASSWORD_ERROR]:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      const message = process.env.NODE_ENV === "development" 
        ? `Email could not be sent: ${err.message}` 
        : "Email could not be sent. Please contact support.";
        
      return res.status(500).json({ success: false, message });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
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
