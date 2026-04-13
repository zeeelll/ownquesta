const { sendNotificationEmail } = require("../utils/email");
const Payment = require("../models/Payment");
const User = require("../models/User");

const normalizeText = (value, maxLength = 200) => String(value ?? "").trim().slice(0, maxLength);

const normalizeProductType = (paymentType, product) => {
  const value = String(paymentType || product || "").toLowerCase();
  if (value.includes("deploy") || value.includes("mlops") || value === "deploy") {
    return "deploy";
  }
  if (value.includes("python") || value.includes(".py") || value.includes("script") || value === "py") {
    return "py";
  }
  if (value.includes("ipynb") || value.includes("notebook") || value.includes("jupyter")) {
    return "ipynb";
  }
  if (value.includes("model") || value.includes("trained-model")) {
    return "model";
  }
  return "other";
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  try {
    const email = normalizeText(req.body?.email, 160).toLowerCase();
    const customerName = normalizeText(req.body?.customerName, 120) || "Customer";
    const orderId = normalizeText(req.body?.orderId, 80);
    const sessionId = normalizeText(req.body?.sessionId, 120);
    const paymentType = normalizeText(req.body?.paymentType, 40).toLowerCase();
    const product = normalizeText(req.body?.product, 120) || "Trained Model";
    const modelName = normalizeText(req.body?.modelName, 120) || "Trained Model";
    const method = normalizeText(req.body?.method, 40).toUpperCase() || "N/A";
    const gateway = normalizeText(req.body?.gateway, 40).toUpperCase() || "RAZORPAY";
    const gatewayOrderId = normalizeText(req.body?.gatewayOrderId, 120);
    const gatewayPaymentId = normalizeText(req.body?.gatewayPaymentId, 120) || "N/A";
    const gatewaySignature = normalizeText(req.body?.gatewaySignature, 200);
    const status = normalizeText(req.body?.status, 30).toLowerCase() || "paid";
    const paidAt = normalizeText(req.body?.paidAt, 80) || new Date().toISOString();
    const amountInr = Number(req.body?.amountInr || 0);

    if (!email || !orderId || !(amountInr > 0)) {
      return res.status(400).json({
        success: false,
        error: "Email, orderId and amountInr are required.",
      });
    }

    const user = await User.findOne({ email }).select("_id").lean();
    const normalizedProductType = normalizeProductType(paymentType, product);

    const paymentRecord = await Payment.findOneAndUpdate(
      { orderId },
      {
        $set: {
          sessionId,
          userId: user?._id || null,
          customerName,
          customerEmail: email,
          product,
          productType: normalizedProductType,
          modelName,
          method,
          gateway,
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
          amountInr,
          status: status === "failed" ? "failed" : status === "created" ? "created" : "paid",
          paidAt: paidAt ? new Date(paidAt) : new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const paidAtDisplay = new Date(paidAt).toLocaleString();
    const amountDisplay = Number(amountInr).toFixed(2);

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #0f172a;">
        <h2 style="margin: 0 0 10px;">Payment Successful</h2>
        <p style="margin: 0 0 12px;">Hi ${customerName},</p>
        <p style="margin: 0 0 14px;">Thank you for your payment. Your transaction has been completed successfully.</p>

        <p style="margin: 0 0 8px;"><strong>Payment Details:</strong></p>
        <div style="border: 1px solid #dbeafe; border-radius: 10px; padding: 14px; background: #f8fbff;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 0 0 8px;"><strong>Paid On:</strong> ${paidAtDisplay}</p>
          <p style="margin: 0 0 8px;"><strong>Amount:</strong> INR ${amountDisplay}</p>
          <p style="margin: 0 0 8px;"><strong>Payment Method:</strong> ${method}</p>
          <p style="margin: 0 0 8px;"><strong>Gateway:</strong> ${gateway}</p>
          <p style="margin: 0 0 8px;"><strong>Gateway Payment ID:</strong> ${gatewayPaymentId}</p>
          <p style="margin: 0 0 8px;"><strong>Product:</strong> ${product}</p>
          <p style="margin: 0;"><strong>Model:</strong> ${modelName}</p>
        </div>

        <p style="margin: 14px 0 0;">If you face any issue with access or download, reply to this email with your Order ID.</p>
        <p style="margin: 12px 0 6px;"><strong>Best regards,</strong></p>
        <p style="margin: 0;"><strong>OwnQuesta Support Team</strong><br/>On behalf of ZS Brother<br/>Explainable AutoML Workflow Platform</p>
      </div>
    `;

    const result = await sendNotificationEmail(
      email,
      `Payment Confirmation - ${orderId}`,
      html
    );

    if (!result?.ok) {
      return res.status(500).json({
        success: false,
        error: "Payment recorded, but confirmation email failed.",
      });
    }

    return res.json({ success: true, paymentId: paymentRecord._id });
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to send payment confirmation email.",
    });
  }
};
