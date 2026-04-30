
const router = require("express").Router();

const requireAuth = require("../middleware/auth.middleware");

const { uploadAdminReport } = require("../config/multer");

router.post("/upload/report", requireAuth, uploadAdminReport.single("file"), async (req, res) => {

  try {

    const s3Url = req.file.location;

    res.json({ success: true, url: s3Url });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;

