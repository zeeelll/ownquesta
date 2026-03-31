// Activity service for logging user actions

const Activity = require("../models/Activity");

class ActivityService {
  static sanitizeMetadata(metadata = {}) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      return {};
    }

    return Object.entries(metadata).reduce((acc, [key, value]) => {
      if (value === undefined) {
        return acc;
      }

      acc[key] = typeof value === "string" ? value.slice(0, 500) : value;
      return acc;
    }, {});
  }

  // Log user activity
  static async logActivity(userId, userEmail, userName, action, description, req = null, metadata = {}) {
    try {
      if (!userId || !userEmail || !userName || !action || !description) {
        return null;
      }

      const normalizedAction = String(action).trim().toLowerCase().replace(/\s+/g, "_").slice(0, 120);
      const normalizedDescription = String(description).trim().slice(0, 300);
      const safeMetadata = this.sanitizeMetadata(metadata);

      const activityData = {
        userId,
        userEmail,
        userName,
        action: normalizedAction,
        description: normalizedDescription,
        metadata: safeMetadata,
        timestamp: new Date()
      };

      // Add request info if available
      if (req) {
        activityData.ipAddress = req.ip || req.connection?.remoteAddress;
        activityData.userAgent = req.get?.('User-Agent') || req.headers?.['user-agent'];
      }

      // If this is an admin action, log who made the change
      if (req && req.user && req.user.role === 'admin') {
        activityData.adminChangedBy = req.user._id;
        activityData.adminEmail = req.user.email;
      }

      if (normalizedAction === 'page_view' && safeMetadata.path) {
        const recentDuplicate = await Activity.findOne({
          userId,
          action: normalizedAction,
          'metadata.path': safeMetadata.path,
          timestamp: { $gte: new Date(Date.now() - 15000) }
        })
          .sort({ timestamp: -1 })
          .lean();

        if (recentDuplicate) {
          return recentDuplicate;
        }
      }

      const activity = new Activity(activityData);
      await activity.save();

      console.log(`📝 Activity logged: ${normalizedAction} by ${userName} (${userEmail})`);
      return activity;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      return null;
    }
  }

  // Get activities for a specific user
  static async getUserActivities(userId, limit = 50) {
    try {
      return await Activity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('adminChangedBy', 'name email');
    } catch (error) {
      console.error('❌ Error fetching user activities:', error);
      return [];
    }
  }

  // Get all activities (admin only)
  static async getAllActivities(limit = 100, skip = 0) {
    try {
      return await Activity.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .populate('adminChangedBy', 'name email');
    } catch (error) {
      console.error('❌ Error fetching all activities:', error);
      return [];
    }
  }

  // Get recent activities for dashboard
  static async getRecentActivities(limit = 20) {
    try {
      return await Activity.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('adminChangedBy', 'name email');
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      return [];
    }
  }
}

module.exports = ActivityService;