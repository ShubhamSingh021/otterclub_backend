import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import env from "../config/env.js";
import User from "../models/User.js";
import Membership from "../models/Membership.js";
import Registration from "../models/Registration.js";

const run = async () => {
  try {
    await connectDatabase(env.mongoUri);
    console.log("Connected to MongoDB.");

    // 1. Basic Stats
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalMembers = await User.countDocuments({ role: 'member' });
    
    console.log(`TOTAL USERS: ${totalUsers}`);
    console.log(`TOTAL MEMBERS: ${totalMembers}`);

    const membershipStats = await Membership.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$membershipType', count: { $sum: 1 }, revenue: { $sum: '$price' } } }
    ]);
    console.log("\nMEMBERSHIP STATS:", JSON.stringify(membershipStats, null, 2));

    const eventStats = await Registration.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'completed'] } } },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$discountedPrice' } } }
    ]);
    console.log("\nEVENT STATS:", JSON.stringify(eventStats, null, 2));

    const totalRevenue = (membershipStats.reduce((acc, curr) => acc + curr.revenue, 0)) + 
                         (eventStats[0]?.revenue || 0);
    console.log(`\nTOTAL REVENUE: ₹${totalRevenue}`);
    console.log(`TOTAL REGISTRATIONS: ${eventStats[0]?.count || 0}`);

    // 2. Revenue Over Time (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const eventTrends = await Registration.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    console.log("\nEVENT REGISTRATION TRENDS (6M):", JSON.stringify(eventTrends, null, 2));

  } catch (error) {
    console.error("Failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed.");
  }
};

run();
