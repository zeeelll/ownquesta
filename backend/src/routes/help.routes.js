const router = require("express").Router();
const helpController = require("../controllers/help.controller");
const { uploadUserDocument } = require("../config/multer");
const HelpTicket = require("../models/HelpTicket");

// Main help ticket route with S3 proof file upload
router.post("/", uploadUserDocument.array("proof", 5), async (req, res) => {
  try {
    // Add S3 URLs to req.body.proofFiles
    if (req.files && req.files.length > 0) {
      req.body.proofFiles = req.files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype,
        url: f.location,
      }));
    }
    return helpController.createHelpTicket(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status", helpController.getHelpTicketStatus);

// Upload proof files for existing ticket
router.post("/upload/proof/:ticketId", uploadUserDocument.array("files", 5), async (req, res) => {
  try {
    const s3Urls = req.files.map(f => ({
      name: f.originalname,
      size: f.size,
      type: f.mimetype,
      url: f.location,
    }));
    await HelpTicket.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { $push: { proofFiles: { $each: s3Urls } } }
    );
    res.json({ success: true, files: s3Urls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
