const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    customerName: { type: String, default: "Customer" },
    customerEmail: { type: String, required: true, index: true },
    product: { type: String, default: "trained-model" },
    productType: {
      type: String,
      enum: ["model", "py", "ipynb", "other"],
      default: "model",
      index: true,
    },
    modelName: { type: String, default: "Trained Model" },
    method: { type: String, default: "N/A" },
    gateway: { type: String, default: "RAZORPAY" },
    gatewayOrderId: { type: String, default: "" },
    gatewayPaymentId: { type: String, default: "" },
    gatewaySignature: { type: String, default: "" },
    amountInr: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "paid",
      index: true,
    },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
