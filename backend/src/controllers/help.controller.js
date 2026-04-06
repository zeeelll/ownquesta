const HelpTicket = require("../models/HelpTicket");
const User = require("../models/User");
const ActivityService = require("../services/activity.service");

const allowedSeverities = new Set(["low", "medium", "high", "urgent"]);

const normalizeText = (value, maxLength = 500) => String(value ?? "").trim().slice(0, maxLength);

const sanitizeProofFiles = (proofFiles = []) => {
  if (!Array.isArray(proofFiles)) return [];

  return proofFiles
    .filter((file) => file && typeof file === "object" && file.name)
    .slice(0, 5)
    .map((file) => ({
      name: normalizeText(file.name, 180),
      size: Number(file.size) || 0,
      type: normalizeText(file.type || "application/octet-stream", 120),
    }));
};

exports.createHelpTicket = async (req, res) => {
  try {
    const name = normalizeText(req.body?.name || req.user?.name, 120);
    const email = normalizeText(req.body?.email || req.user?.email, 160).toLowerCase();
    const issueType = normalizeText(req.body?.issueType || "other", 60).toLowerCase() || "other";
    const pageArea = normalizeText(req.body?.pageArea || "Other", 80) || "Other";
    const severity = allowedSeverities.has(req.body?.severity) ? req.body.severity : "medium";
    const subject = normalizeText(req.body?.subject, 180);
    const description = normalizeText(req.body?.description, 4000);
    const stepsTried = normalizeText(req.body?.stepsTried, 2000);
    const proofFiles = sanitizeProofFiles(req.body?.proofFiles);

    if (!name || !email || !subject || description.length < 20) {
      return res.status(400).json({
        success: false,
        error: "Please provide your name, email, subject, and a clear issue description.",
      });
    }

    const linkedUser = req.user?._id
      ? req.user
      : await User.findOne({ email }).select("_id name email role").lean();

    const ticketId = `OQ-HELP-${Date.now().toString(36).toUpperCase()}`;

    await HelpTicket.create({
      ticketId,
      userId: linkedUser?._id || null,
      name,
      email,
      issueType,
      pageArea,
      severity,
      subject,
      description,
      stepsTried,
      proofFiles,
      submittedFrom: normalizeText(req.body?.submittedFrom || "help_page", 60),
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get?.("User-Agent") || req.headers?.["user-agent"],
    });

    if (linkedUser?._id) {
      await ActivityService.logActivity(
        linkedUser._id,
        linkedUser.email || email,
        linkedUser.name || name,
        "help_request_submitted",
        `Submitted help request: ${subject}`,
        req,
        {
          ticketId,
          issueType,
          pageArea,
          severity,
          proofCount: proofFiles.length,
        }
      );
    }

    return res.status(201).json({
      success: true,
      ticketId,
      status: "underprocess",
      proofCount: proofFiles.length,
      message:
        proofFiles.length > 0
          ? `Help request submitted with ${proofFiles.length} proof file(s). Keep your ticket ID for reference.`
          : "Help request submitted successfully. Keep your ticket ID for reference.",
    });
  } catch (error) {
    console.error("Error creating help ticket:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to submit the help request right now.",
    });
  }
};

exports.getHelpTickets = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 300);
    const status = normalizeText(req.query.status || "all", 30).toLowerCase();
    const search = normalizeText(req.query.search || "", 120);

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { ticketId: regex },
        { name: regex },
        { email: regex },
        { subject: regex },
        { description: regex },
        { issueType: regex },
        { pageArea: regex },
      ];
    }

    const tickets = await HelpTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name email role")
      .lean();

    return res.json({ tickets });
  } catch (error) {
    console.error("Error fetching help tickets:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getHelpTicketStatus = async (req, res) => {
  try {
    const ticketId = normalizeText(req.query.ticketId, 80);
    const email = normalizeText(req.query.email, 160).toLowerCase();

    if (!ticketId || !email) {
      return res.status(400).json({
        success: false,
        error: "Please provide ticket ID and email.",
      });
    }

    const ticket = await HelpTicket.findOne({ ticketId, email })
      .select("ticketId name email issueType pageArea severity subject description status stepsTried proofFiles createdAt updatedAt")
      .lean();

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Complaint not found for the provided ticket ID and email.",
      });
    }

    const complaintStatus = ticket.status === "resolved" ? "complete" : "underprocess";

    return res.json({
      success: true,
      complaint: {
        ...ticket,
        complaintStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching complaint status:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to fetch complaint status right now.",
    });
  }
};
