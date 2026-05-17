import Testimonial from "../models/Testimonial.js";
import Registration from "../models/Registration.js";
import Membership from "../models/Membership.js";
import { createCrudController } from "./crudFactory.js";

// Helper to evaluate eligibility
const getEligibilityInfo = async (userId) => {
  // Check active membership
  const activeMembership = await Membership.findOne({
    user: userId,
    membershipStatus: "active",
    expiryDate: { $gt: new Date() },
  });

  // Check event registration (where payment is paid/completed)
  const registrations = await Registration.find({
    user: userId,
    paymentStatus: { $in: ["paid", "completed"] },
    registrationStatus: { $ne: "cancelled" },
  }).populate("event");

  const attended = registrations.some((r) => r.attendanceStatus === "attended");
  const hasBookings = registrations.length > 0;

  // Compile list of events they can select
  const eligibleEvents = registrations
    .map((r) => {
      if (!r.event) return null;
      return {
        _id: r.event._id,
        title: r.event.title,
        eventDate: r.event.eventDate,
        attendanceStatus: r.attendanceStatus,
      };
    })
    .filter(Boolean);

  const isEligible = !!activeMembership || attended || hasBookings;

  return {
    isEligible,
    membershipType: activeMembership ? activeMembership.membershipType : "",
    eligibleEvents,
    hasAttended: attended,
    hasBookings,
  };
};

// Start with standard crud controller for legacy requests
const baseController = createCrudController(Testimonial, {
  defaultSort: "-isFeatured -updatedAt",
});

// Extend baseController with custom actions
export const testimonialController = {
  ...baseController,

  // 1. Get user eligibility
  getEligibility: async (req, res) => {
    try {
      const eligibility = await getEligibilityInfo(req.user._id);
      res.status(200).json({ success: true, data: eligibility });
    } catch (error) {
      console.error("Eligibility Check Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 2. Submit user review
  submitReview: async (req, res) => {
    try {
      const { rating, review, title, eventId } = req.body;

      // Validate inputs
      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }

      if (!review || review.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Review must be at least 10 characters long",
        });
      }

      // Check eligibility
      const eligibility = await getEligibilityInfo(req.user._id);
      if (!eligibility.isEligible) {
        return res.status(403).json({
          success: false,
          message: "You are not eligible to write a review. You must have an active membership or have booked/attended an event.",
        });
      }

      // If eventId is provided, verify they actually registered for it
      let eventName = "";
      if (eventId) {
        const matchingEvent = eligibility.eligibleEvents.find(
          (e) => e._id.toString() === eventId.toString()
        );
        if (!matchingEvent) {
          return res.status(400).json({
            success: false,
            message: "You can only write a review for events you registered for.",
          });
        }
        eventName = matchingEvent.title;
      }

      // Create new review
      const newReview = await Testimonial.create({
        userId: req.user._id,
        userName: req.user.name,
        avatar: req.user.avatar || "",
        membershipType: eligibility.membershipType || "",
        eventId: eventId || null,
        eventName: eventName || "",
        rating: parsedRating,
        title: title || "",
        review: review.trim(),
        status: "pending",
        featured: false,
      });

      res.status(201).json({ success: true, data: newReview });
    } catch (error) {
      console.error("Submit Review Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 3. Get user's own reviews
  getMyReviews: async (req, res) => {
    try {
      const reviews = await Testimonial.find({ userId: req.user._id }).sort("-createdAt");
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      console.error("Get My Reviews Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 4. Update user's pending review
  updateMyReview: async (req, res) => {
    try {
      const { rating, review, title, eventId } = req.body;
      const reviewId = req.params.id;

      const existingReview = await Testimonial.findOne({ _id: reviewId, userId: req.user._id });
      if (!existingReview) {
        return res.status(404).json({ success: false, message: "Review not found" });
      }

      // Check if it is pending
      if (existingReview.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Approved or rejected reviews cannot be edited.",
        });
      }

      // Validate inputs
      const parsedRating = Number(rating);
      if (rating !== undefined && (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }

      if (review !== undefined && review.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Review must be at least 10 characters long",
        });
      }

      // Check event selection eligibility if eventId is changing
      let eventName = existingReview.eventName;
      if (eventId && eventId.toString() !== (existingReview.eventId?.toString() || "")) {
        const eligibility = await getEligibilityInfo(req.user._id);
        const matchingEvent = eligibility.eligibleEvents.find(
          (e) => e._id.toString() === eventId.toString()
        );
        if (!matchingEvent) {
          return res.status(400).json({
            success: false,
            message: "You can only write a review for events you registered for.",
          });
        }
        eventName = matchingEvent.title;
        existingReview.eventId = eventId;
        existingReview.eventName = eventName;
      } else if (eventId === null || eventId === "") {
        existingReview.eventId = null;
        existingReview.eventName = "";
      }

      // Update remaining fields
      if (rating !== undefined) existingReview.rating = parsedRating;
      if (review !== undefined) existingReview.review = review.trim();
      if (title !== undefined) existingReview.title = title;

      // Save document (which fires the pre-save sync hook!)
      await existingReview.save();

      res.status(200).json({ success: true, data: existingReview });
    } catch (error) {
      console.error("Update Review Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 5. Delete user's pending review
  deleteMyReview: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const existingReview = await Testimonial.findOne({ _id: reviewId, userId: req.user._id });
      
      if (!existingReview) {
        return res.status(404).json({ success: false, message: "Review not found" });
      }

      if (existingReview.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Approved or rejected reviews cannot be deleted.",
        });
      }

      await Testimonial.findByIdAndDelete(reviewId);
      res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      console.error("Delete Review Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 6. Admin: List all testimonials (with filters and paging)
  adminListReviews: async (req, res) => {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const skip = (page - 1) * limit;
      const { status, type } = req.query;

      const filter = {};
      if (status) {
        filter.status = status;
      }
      if (type === "user") {
        filter.userId = { $ne: null };
      } else if (type === "cms") {
        filter.userId = null;
      }

      const [totalItems, rawItems] = await Promise.all([
        Testimonial.countDocuments(filter),
        Testimonial.find(filter)
          .sort("-createdAt")
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

      res.status(200).json({
        success: true,
        data: rawItems,
        meta: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit) || 1,
        },
      });
    } catch (error) {
      console.error("Admin List Reviews Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 7. Admin: Update status (Approve / Reject)
  adminUpdateStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const reviewId = req.params.id;

      if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      // Find the document
      const review = await Testimonial.findById(reviewId);
      if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
      }

      review.status = status;
      await review.save(); // Save to trigger the pre-save sync hooks!

      res.status(200).json({ success: true, data: review });
    } catch (error) {
      console.error("Admin Update Status Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 8. Admin: Toggle Featured Status
  adminToggleFeatured: async (req, res) => {
    try {
      const { featured } = req.body;
      const reviewId = req.params.id;

      if (featured === undefined) {
        return res.status(400).json({ success: false, message: "Featured status is required" });
      }

      const review = await Testimonial.findById(reviewId);
      if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
      }

      review.featured = !!featured;
      await review.save(); // Save to trigger pre-save sync hooks!

      res.status(200).json({ success: true, data: review });
    } catch (error) {
      console.error("Admin Toggle Featured Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
