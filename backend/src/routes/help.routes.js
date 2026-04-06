const router = require("express").Router();
const helpController = require("../controllers/help.controller");

router.post("/", helpController.createHelpTicket);
router.get("/status", helpController.getHelpTicketStatus);

module.exports = router;
