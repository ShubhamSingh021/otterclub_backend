import Notification from "../models/Notification.js";
import User from "../models/User.js";

/**
 * @desc    Get user's notifications (newest first)
 * @route   GET /api/v1/notifications
 * @access  Protected (User)
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch notifications specifically for the user, or global ones (userId = null)
    const notifications = await Notification.find({
      $or: [{ userId }, { userId: null }],
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter(n => !n.read).length;

    return res.status(200).json({ 
      success: true, 
      data: notifications, 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Protected (User)
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Only allow marking read if it belongs to user or is global
    if (notification.userId && notification.userId.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark all notifications for this user as read
 * @route   PUT /api/v1/notifications/read-all
 * @access  Protected (User)
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Mark all notifications matching user or global as read
    await Notification.updateMany(
      {
        $or: [{ userId }, { userId: null }],
        read: false,
      },
      { read: true }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Protected (User)
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.userId && notification.userId.toString() !== userId.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await Notification.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Broadcast a notification to a target demographic (Admin)
 * @route   POST /api/v1/notifications/admin/broadcast
 * @access  Private (Admin)
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, target, link } = req.body;

    if (!title || !message || !type || !target) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    let targetUsers = [];
    if (target === "all") {
      targetUsers = await User.find({}, "_id");
    } else if (target === "members") {
      // Find users who have an active membership
      targetUsers = await User.find(
        {
          "activeMembership.membershipStatus": "active",
        },
        "_id"
      );
    } else if (target === "admins") {
      // If admins need notifications, we can handle it. For now, since global/personal is for users, let's keep it user-centric.
      targetUsers = await User.find({ role: "admin" }, "_id");
    }

    if (targetUsers.length === 0) {
      return res.status(200).json({ success: true, message: "No matching target users found" });
    }

    const notifications = targetUsers.map((u) => ({
      userId: u._id,
      title,
      message,
      type: type || "announcement",
      link: link || null,
      read: false,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: `Successfully broadcasted notification to ${targetUsers.length} users.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
