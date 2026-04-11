const router = require("express").Router();
const paymentsController = require("../controllers/payments.controller");

router.post("/notify-success", paymentsController.sendPaymentSuccessEmail);

module.exports = router;
