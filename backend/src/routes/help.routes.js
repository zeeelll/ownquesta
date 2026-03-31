const router = require("express").Router();
const helpController = require("../controllers/help.controller");

router.post("/", helpController.createHelpTicket);

module.exports = router;
