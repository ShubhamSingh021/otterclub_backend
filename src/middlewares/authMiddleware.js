import jwt from "jsonwebtoken";
import env from "../config/env.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, env.jwtSecret);

      // Get user from the token (Check Admin first, then User)
      let user = await Admin.findById(decoded.id).select("-password");
      if (!user) {
        user = await User.findById(decoded.id).select("-password").populate("activeMembership");
      }

      req.user = user;

      if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authorized, user not found" });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, env.jwtSecret);
      
      let user = await Admin.findById(decoded.id).select("-password");
      if (!user) {
        user = await User.findById(decoded.id).select("-password").populate("activeMembership");
      }
      req.user = user;
    } catch (error) {
      console.error("Optional Auth Error:", error);
    }
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    return next();
  } else {
    return res.status(403).json({ success: false, message: "Not authorized as an admin" });
  }
};
