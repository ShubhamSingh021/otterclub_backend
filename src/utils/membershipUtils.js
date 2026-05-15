import Membership from "../models/Membership.js";
import User from "../models/User.js";

/**
 * Checks for expired memberships and updates their status
 */
export const checkExpiredMemberships = async () => {
  try {
    const now = new Date();
    
    // Find memberships that are active but expired
    const expiredMemberships = await Membership.find({
      membershipStatus: "active",
      expiryDate: { $lt: now }
    });

    if (expiredMemberships.length > 0) {
      console.log(`Found ${expiredMemberships.length} expired memberships. Updating...`);
      
      for (const membership of expiredMemberships) {
        membership.membershipStatus = "expired";
        await membership.save();

        // Update user role and clear active membership ref
        await User.findByIdAndUpdate(membership.user, {
          activeMembership: null,
          role: "user"
        });
      }
    }
  } catch (error) {
    console.error("Error checking expired memberships:", error);
  }
};
