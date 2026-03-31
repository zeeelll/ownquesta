const mongoose = require("mongoose");

const proofFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, default: 0 },
    type: { type: String, default: "application/octet-stream" },
  },
  { _id: false }
);

const helpTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    issueType: { type: String, required: true, default: "other" },
    pageArea: { type: String, default: "Other" },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    stepsTried: { type: String, default: "" },
    proofFiles: { type: [proofFileSchema], default: [] },
    submittedFrom: { type: String, default: "help_page" },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

helpTicketSchema.index({ createdAt: -1 });
helpTicketSchema.index({ status: 1, createdAt: -1 });
helpTicketSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("HelpTicket", helpTicketSchema);
