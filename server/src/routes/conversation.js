const express = require("express");
const {
  createConversation,
  pollConversation,
  continueConversation,
  listMessages,
  confirmOrRejectToolRun,
} = require("../controllers/conversationController");

const router = express.Router();

router.post("/create", createConversation);
router.get("/poll/:studioId/:jobId", pollConversation);
router.post("/continue", continueConversation);
router.post("/list", listMessages);
router.post("/confirm", confirmOrRejectToolRun);

module.exports = router;
