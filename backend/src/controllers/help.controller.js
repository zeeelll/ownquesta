const HelpTicket = require("../models/HelpTicket");
const User = require("../models/User");
const ActivityService = require("../services/activity.service");
const { sendNotificationEmail } = require("../utils/email");

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

const buildHelpRequestConfirmationEmail = ({ name, ticketId, subject, issueType, pageArea, severity, proofCount }) => {
  const safeName = name || "there";
  const safeSubject = subject || "Help Request";
  const safeIssueType = issueType || "other";
  const safePageArea = pageArea || "Other";
  const safeSeverity = (severity || "medium").toUpperCase();
  const submittedAt = new Date().toLocaleString();

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #0f172a;">
      <p style="margin: 0 0 12px;">Hi ${safeName},</p>
      <p style="margin: 0 0 14px;">Thank you for reaching out to <strong>OwnQuesta</strong> support.</p>

      <p style="margin: 0 0 8px;"><strong>Your Help Request Details:</strong></p>
      <div style="border: 1px solid #dbeafe; border-radius: 10px; padding: 14px; background: #f8fbff; margin-bottom: 14px;">
        <p style="margin: 0 0 8px;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin: 0 0 8px;"><strong>Submitted:</strong> ${submittedAt}</p>
        <p style="margin: 0 0 8px;"><strong>Request Type:</strong> ${safeIssueType}</p>
        <p style="margin: 0;"><strong>Status:</strong> Received and Under Review</p>
      </div>

      <p style="margin: 0 0 8px;"><strong>What Happens Next?</strong></p>
      <ol style="margin: 0 0 14px 20px; padding: 0;">
        <li style="margin-bottom: 6px;"><strong>Immediate:</strong> Your request has been logged in our system.</li>
        <li style="margin-bottom: 6px;"><strong>Within 24 hours:</strong> Our support team will review your issue.</li>
        <li style="margin-bottom: 6px;"><strong>Within 48 hours:</strong> You will receive a detailed response or solution.</li>
      </ol>

      <p style="margin: 0 0 8px;"><strong>Your Request:</strong></p>
      <div style="border-left: 3px solid #93c5fd; padding-left: 12px; margin-bottom: 14px;">
        <p style="margin: 0 0 6px;"><strong>Subject:</strong> ${safeSubject}</p>
        <p style="margin: 0 0 6px;"><strong>Category:</strong> ${safeIssueType}</p>
        <p style="margin: 0 0 6px;"><strong>Area:</strong> ${safePageArea}</p>
        <p style="margin: 0 0 6px;"><strong>Severity:</strong> ${safeSeverity}</p>
        <p style="margin: 0;"><strong>Attachments:</strong> ${proofCount}</p>
      </div>

      <p style="margin: 0 0 8px;"><strong>Meanwhile, You Can:</strong></p>
      <ul style="margin: 0 0 14px 20px; padding: 0;">
        <li style="margin-bottom: 5px;"><strong>Browse Our Help Page:</strong> Many common questions are answered there.</li>
        <li style="margin-bottom: 5px;"><strong>Watch Tutorials:</strong> Check our Tutorial Page for step-by-step guides.</li>
        <li style="margin-bottom: 5px;"><strong>Community:</strong> Visit our ML Tutorial Page for community solutions.</li>
        <li style="margin-bottom: 5px;"><strong>Documentation:</strong> Explore the Beginner and Know ML sections.</li>
      </ul>

      <p style="margin: 0 0 8px;"><strong>Need Urgent Assistance?</strong></p>
      <p style="margin: 0 0 6px;">If this is a critical issue affecting your work:</p>
      <ul style="margin: 0 0 14px 20px; padding: 0;">
        <li style="margin-bottom: 5px;">Mark your ticket as "Urgent" by replying to this email.</li>
        <li style="margin-bottom: 5px;">Include any error messages or screenshots.</li>
        <li style="margin-bottom: 5px;">Describe the impact on your workflow.</li>
      </ul>

      <p style="margin: 0 0 8px;"><strong>Tracking Your Request:</strong></p>
      <p style="margin: 0 0 14px;">You can check the status of your ticket anytime by visiting your Dashboard or referencing your Ticket ID: <strong>${ticketId}</strong>.</p>

      <p style="margin: 0 0 8px;"><strong>We are Here to Help:</strong></p>
      <p style="margin: 0 0 14px;">At OwnQuesta, we are committed to making your machine learning experience smooth and successful. Our team is working on your request and will get back to you soon.</p>

      <p style="margin: 0 0 12px;">Thank you for your patience!</p>
      <p style="margin: 0 0 6px;"><strong>Best regards,</strong></p>
      <p style="margin: 0;"><strong>OwnQuesta Support Team</strong><br/>On behalf of ZS Brother<br/>Explainable AutoML Workflow Platform</p>
    </div>
  `;
};

exports.createHelpTicket = async (req, res) => {
  try {
    const name = normalizeText(req.user?.name || req.body?.name, 120);
    const email = normalizeText(req.user?.email || req.body?.email, 160).toLowerCase();
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

    // Send confirmation in background so SMTP failures do not block ticket creation.
    setImmediate(async () => {
      try {
        const html = buildHelpRequestConfirmationEmail({
          name,
          ticketId,
          subject,
          issueType,
          pageArea,
          severity,
          proofCount: proofFiles.length,
        });

        const result = await sendNotificationEmail(
          email,
          `Help Request Received - ${ticketId}`,
          html
        );

        if (!result?.ok) {
          console.warn("Help request confirmation email failed:", result?.error?.message || result?.error);
        }
      } catch (emailErr) {
        console.warn("Help request confirmation email failed:", emailErr?.message || emailErr);
      }
    });

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
    const ticketId = normalizeText(req.query.ticketId, 80).toUpperCase();
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

    return res.json({
      success: true,
      complaint: {
        ...ticket,
        complaintStatus: ticket.status === "resolved" ? "complete" : "underprocess",
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
