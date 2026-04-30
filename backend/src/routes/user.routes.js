// User routes

const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const ActivityService = require("../services/activity.service");
const userAssetsController = require("../controllers/userAssets.controller");
const subscriptionController = require("../controllers/subscription.controller");

router.get("/dashboard", requireAuth, (req, res) => {
  res.json({ message: "Welcome Dashboard ✅", user: req.user });
});

router.get("/activities", requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const activities = await ActivityService.getUserActivities(req.user._id, limit);
    res.json({ activities });
  } catch (error) {
    console.error("Error fetching current user activities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/activity", requireAuth, async (req, res) => {
  try {
    const rawAction = typeof req.body?.action === "string" ? req.body.action : "page_view";
    const rawDescription = typeof req.body?.description === "string"
      ? req.body.description
      : "User activity recorded";
    const metadata = req.body?.metadata && typeof req.body.metadata === "object" && !Array.isArray(req.body.metadata)
      ? req.body.metadata
      : {};

    const action = rawAction.trim().toLowerCase().replace(/[^a-z0-9_:-]/gi, "_").slice(0, 100) || "page_view";
    const description = rawDescription.trim().slice(0, 300) || "User activity recorded";

    await ActivityService.logActivity(
      req.user._id,
      req.user.email,
      req.user.name,
      action,
      description,
      req,
      metadata
    );

    res.status(201).json({ message: "Activity recorded" });
  } catch (error) {
    console.error("Error recording user activity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/downloads", requireAuth, userAssetsController.getMyDownloads);
router.post("/downloads/track", requireAuth, userAssetsController.trackDownloadAccess);
router.post("/membership/upgrade", requireAuth, userAssetsController.upgradeMembership);
router.get("/deployments", requireAuth, userAssetsController.getMyDeployments);
router.post("/deployments/provision", requireAuth, userAssetsController.provisionDeployment);
router.patch("/deployments/:id/scale", requireAuth, userAssetsController.scaleDeployment);

// Subscription routes
router.post("/subscription/submit", requireAuth, subscriptionController.submitSubscription);
router.get("/subscription/status", requireAuth, subscriptionController.getSubscriptionStatus);

module.exports = router;

const { uploadUserProfile } = require("../config/multer");

const User = require("../models/User");

router.post("/upload/avatar", requireAuth, uploadUserProfile.single("file"), async (req, res) => {

  try {

    const s3Url = req.file.location;

    await User.findByIdAndUpdate(req.user._id, { avatar: s3Url });

    res.json({ success: true, avatar: s3Url });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

