// Admin controller

const User = require("../models/User");
const Project = require("../models/Project");
const Payment = require("../models/Payment");
const DownloadAccess = require("../models/DownloadAccess");
const ActivityService = require("../services/activity.service");

const ACTIVE_PROJECT_STAGES = ["dataset_uploaded", "eda_completed", "model_selected", "training"];
const COMPLETED_PROJECT_STAGES = ["trained", "evaluated", "completed"];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret -resetOtp -resetOtpExpiry');
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -twoFactorSecret -resetOtp -resetOtpExpiry');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, bio, company, jobTitle, location, skills } = req.body;
    const oldUser = await User.findById(req.params.id);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, bio, company, jobTitle, location, skills },
      { new: true }
    ).select('-password -twoFactorSecret -resetOtp -resetOtpExpiry');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the admin action
    await ActivityService.logActivity(
      user._id,
      user.email,
      user.name,
      'admin_update_profile',
      `Profile updated by admin ${req.user.name}`,
      req,
      {
        oldData: {
          name: oldUser.name,
          email: oldUser.email,
          role: oldUser.role,
          phone: oldUser.phone,
          company: oldUser.company
        },
        newData: {
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          company: user.company
        }
      }
    );

    res.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the deletion before removing
    await ActivityService.logActivity(
      user._id,
      user.email,
      user.name,
      'admin_delete_account',
      `Account deleted by admin ${req.user.name}`,
      req,
      {
        deletedUser: {
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    );

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password -twoFactorSecret -resetOtp -resetOtpExpiry');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the role change
    await ActivityService.logActivity(
      user._id,
      user.email,
      user.name,
      'admin_role_change',
      `Promoted to admin by ${req.user.name}`,
      req,
      { newRole: 'admin', changedBy: req.user.name }
    );

    res.json({ user });
  } catch (error) {
    console.error("Error making user admin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'user' },
      { new: true }
    ).select('-password -twoFactorSecret -resetOtp -resetOtpExpiry');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log the role change
    await ActivityService.logActivity(
      user._id,
      user.email,
      user.name,
      'admin_role_change',
      `Admin role removed by ${req.user.name}`,
      req,
      { newRole: 'user', changedBy: req.user.name }
    );

    res.json({ user });
  } catch (error) {
    console.error("Error removing admin role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user activities
exports.getUserActivities = async (req, res) => {
  try {
    const activities = await ActivityService.getUserActivities(req.params.id);
    res.json({ activities });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all activities (recent)
exports.getAllActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;
    const activities = await ActivityService.getAllActivities(limit, skip);
    res.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all user projects for admin view
exports.getAllProjects = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const stage = typeof req.query.stage === "string" ? req.query.stage.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";

    const query = {};
    if (stage && stage !== "all") query.stage = stage;

    let projects = await Project.find(query)
      .populate("userId", "name email role")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    if (search) {
      projects = projects.filter((project) => {
        const owner = project.userId && typeof project.userId === "object" ? project.userId : null;
        return [
          project.name,
          project.dataset?.filename,
          project.problemType,
          project.targetColumn,
          project.selectedModel,
          owner?.name,
          owner?.email,
        ].some((value) => typeof value === "string" && value.toLowerCase().includes(search));
      });
    }

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get aggregate project statistics for admin dashboard
exports.getProjectStats = async (req, res) => {
  try {
    const projects = await Project.find().select("stage createdAt").lean();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const byStage = projects.reduce((acc, project) => {
      const key = project.stage || "initialized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total: projects.length,
      active: projects.filter((project) => ACTIVE_PROJECT_STAGES.includes(project.stage)).length,
      completed: projects.filter((project) => COMPLETED_PROJECT_STAGES.includes(project.stage)).length,
      initialized: projects.filter((project) => (project.stage || "initialized") === "initialized").length,
      recent: projects.filter((project) => project.createdAt && new Date(project.createdAt) >= sevenDaysAgo).length,
      byStage,
    });
  } catch (error) {
    console.error("Error fetching project stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all projects for a specific user (admin)
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get payment records for admin view
exports.getAllPayments = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const status = typeof req.query.status === "string" ? req.query.status.trim().toLowerCase() : "";
    const productType = typeof req.query.productType === "string" ? req.query.productType.trim().toLowerCase() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";

    const query = {};
    if (status && status !== "all") query.status = status;
    if (productType && productType !== "all") query.productType = productType;

    let payments = await Payment.find(query)
      .populate("userId", "name email role")
      .sort({ paidAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (search) {
      payments = payments.filter((payment) => {
        const linkedUser = payment.userId && typeof payment.userId === "object" ? payment.userId : null;
        return [
          payment.orderId,
          payment.customerName,
          payment.customerEmail,
          payment.product,
          payment.modelName,
          payment.method,
          payment.gateway,
          payment.gatewayPaymentId,
          payment.sessionId,
          payment.productType,
          linkedUser?.name,
          linkedUser?.email,
          linkedUser?.role,
        ].some((value) => typeof value === "string" && value.toLowerCase().includes(search));
      });
    }

    const downloadQuery = {};
    if (productType && productType !== "all") downloadQuery.productType = productType;

    let downloads = await DownloadAccess.find(downloadQuery)
      .populate("userId", "name email role")
      .sort({ downloadedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    if (status && status !== "all") {
      if (status === "paid") {
        downloads = downloads.filter((record) => record.accessType === "paid");
      } else if (status === "created" || status === "failed") {
        downloads = [];
      }
    }

    if (search) {
      downloads = downloads.filter((record) => {
        const linkedUser = record.userId && typeof record.userId === "object" ? record.userId : null;
        return [
          record.orderId,
          record.customerName,
          record.customerEmail,
          record.modelName,
          record.fileName,
          record.source,
          record.productType,
          record.accessType,
          record.sessionId,
          linkedUser?.name,
          linkedUser?.email,
          linkedUser?.role,
        ].some((value) => typeof value === "string" && value.toLowerCase().includes(search));
      });
    }

    const summary = {
      total: payments.length,
      paid: payments.filter((payment) => payment.status === "paid").length,
      freeDownloads: downloads.filter((record) => record.accessType === "free").length,
      paidDownloads: downloads.filter((record) => record.accessType === "paid").length,
      downloadEvents: downloads.length,
      revenueInr: Number(
        payments
          .filter((payment) => payment.status === "paid")
          .reduce((sum, payment) => sum + Number(payment.amountInr || 0), 0)
          .toFixed(2)
      ),
    };

    res.json({ payments, downloads, summary });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};