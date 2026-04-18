const Payment = require("../models/Payment");
const User = require("../models/User");
const ActivityService = require("../services/activity.service");

const PLAN_PRICES = { plan_750: 750, plan_1399: 1399 };

function sanitizeId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

function normalizeScreenshot(raw) {
  if (!raw || typeof raw !== "object") return null;
  const dataUrl = String(raw.dataUrl || "").trim();
  if (!dataUrl) return null;
  if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl))
    return { error: "Invalid screenshot format." };
  if (dataUrl.length > 7 * 1024 * 1024)
    return { error: "Screenshot too large (max 7 MB)." };
  return {
    fileName: String(raw.fileName || "payment-proof").trim().slice(0, 180),
    mimeType: String(raw.mimeType || "image/png").trim().toLowerCase(),
    dataUrl,
  };
}

// POST /api/user/subscription/submit
exports.submitSubscription = async (req, res) => {
  try {
    const {
      planType,
      customerName,
      customerEmail,
      transactionId,
      payerUpiId,
      paymentTime,
      paymentScreenshot,
    } = req.body;

    if (!["plan_750", "plan_1399"].includes(planType))
      return res.status(400).json({ message: "Invalid plan selected." });

    const screenshot = normalizeScreenshot(paymentScreenshot);
    if (!screenshot) return res.status(400).json({ message: "Payment screenshot is required." });
    if (screenshot.error) return res.status(400).json({ message: screenshot.error });

    const txId = String(transactionId || "").trim();
    if (txId.length < 6) return res.status(400).json({ message: "Enter a valid transaction ID." });

    const amount = PLAN_PRICES[planType];
    const ts = Date.now().toString(36).toUpperCase();
    const orderId = `SUB-${planType.replace("plan_", "")}-${sanitizeId(req.user.userId || req.user._id.toString().slice(-6))}-${ts}`;

    const payment = await Payment.create({
      orderId,
      userId: req.user._id,
      customerName: String(customerName || req.user.name || "").trim().slice(0, 100),
      customerEmail: String(customerEmail || req.user.email || "").trim().toLowerCase(),
      product: `subscription-${planType}`,
      productType: "subscription",
      planType,
      amountInr: amount,
      gateway: "OWNQUESTA_MANUAL",
      method: "upi",
      transactionId: txId,
      payerUpiId: String(payerUpiId || "").trim().slice(0, 80),
      paymentTime: paymentTime ? new Date(paymentTime) : new Date(),
      paymentScreenshot: screenshot,
      status: "pending",
      paidAt: null,
    });

    await ActivityService.logActivity(
      req.user._id,
      req.user.email,
      req.user.name,
      "subscription_submitted",
      `Subscription payment submitted for ${planType} (₹${amount})`,
      req,
      { orderId, planType, amount }
    );

    return res.status(201).json({
      message: "Payment submitted. Pending admin verification (3–4 hours).",
      payment: { orderId, status: "pending", planType, amountInr: amount },
    });
  } catch (error) {
    console.error("submitSubscription error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /api/user/subscription/status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const pending = await Payment.findOne({
      userId: req.user._id,
      productType: "subscription",
      status: "pending",
    }).sort({ createdAt: -1 }).lean();

    return res.json({
      membershipStatus: req.user.membershipStatus,
      membershipPlan: req.user.membershipPlan,
      membershipExpiresAt: req.user.membershipExpiresAt,
      pendingPayment: pending
        ? { orderId: pending.orderId, planType: pending.planType, submittedAt: pending.createdAt }
        : null,
    });
  } catch (error) {
    console.error("getSubscriptionStatus error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/admin/payments/:id/approve  (admin only)
exports.approveSubscription = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("userId");
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    if (payment.productType !== "subscription")
      return res.status(400).json({ message: "Not a subscription payment." });
    if (payment.status === "paid")
      return res.status(400).json({ message: "Already approved." });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    payment.status = "paid";
    payment.paidAt = now;
    await payment.save();

    const user = payment.userId;
    if (user) {
      user.membershipStatus = "ownque_user";
      user.membershipPlan = payment.planType || "plan_1399";
      user.membershipUpgradedAt = now;
      user.membershipExpiresAt = expiresAt;
      await user.save();

      await ActivityService.logActivity(
        user._id,
        user.email,
        user.name,
        "subscription_approved",
        `Subscription approved by admin ${req.user.name} — plan: ${payment.planType}`,
        req,
        { orderId: payment.orderId, planType: payment.planType, expiresAt }
      );
    }

    return res.json({ message: "Subscription approved. User is now premium.", payment, user });
  } catch (error) {
    console.error("approveSubscription error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/admin/payments/:id/reject  (admin only)
exports.rejectSubscription = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("userId");
    if (!payment) return res.status(404).json({ message: "Payment not found." });
    if (payment.productType !== "subscription")
      return res.status(400).json({ message: "Not a subscription payment." });
    if (payment.status === "failed")
      return res.status(400).json({ message: "Already rejected." });

    payment.status = "failed";
    await payment.save();

    const user = payment.userId;
    if (user) {
      await ActivityService.logActivity(
        user._id,
        user.email,
        user.name,
        "subscription_rejected",
        `Subscription rejected by admin ${req.user.name}`,
        req,
        { orderId: payment.orderId, planType: payment.planType }
      );
    }

    return res.json({ message: "Subscription rejected.", payment });
  } catch (error) {
    console.error("rejectSubscription error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// GET /api/admin/payments/subscriptions  (admin only)
exports.getSubscriptionPayments = async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status.trim().toLowerCase() : "";
    const query = { productType: "subscription" };
    if (status && status !== "all") query.status = status;

    const payments = await Payment.find(query)
      .populate("userId", "name email membershipStatus membershipPlan membershipExpiresAt")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({ payments });
  } catch (error) {
    console.error("getSubscriptionPayments error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
