const router = require("express").Router();
const paymentsController = require("../controllers/payments.controller");

router.post("/notify-success", paymentsController.sendPaymentSuccessEmail);

module.exports = router;

const requireAuth = require("../middleware/auth.middleware");

const { uploadPaymentInvoice } = require("../config/multer");

const Payment = require("../models/Payment");

router.post("/upload/invoice/:orderId", requireAuth, uploadPaymentInvoice.single("file"), async (req, res) => {

  try {

    const s3Url = req.file.location;

    await Payment.findOneAndUpdate(

      { orderId: req.params.orderId },

      { $set: { invoiceUrl: s3Url } }

    );

    res.json({ success: true, url: s3Url });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

