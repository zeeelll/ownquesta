const mongoose = require("mongoose");

const downloadAccessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, default: "User" },
    customerEmail: { type: String, required: true, index: true },
    sessionId: { type: String, default: "", index: true },
    orderId: { type: String, default: "", index: true },
    modelName: { type: String, default: "Trained Model" },
    productType: {
      type: String,
      enum: ["model", "py", "ipynb", "other"],
      default: "model",
      index: true,
    },
    fileName: { type: String, default: "" },
    source: { type: String, default: "automl" },
    accessType: {
      type: String,
      enum: ["free", "paid"],
      default: "free",
      index: true,
    },
    amountInr: { type: Number, default: 0, min: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    downloadedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DownloadAccess", downloadAccessSchema);
