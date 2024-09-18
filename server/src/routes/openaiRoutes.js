const express = require("express");
const {
  createAssistant,
  retrieveAssistant,
  createThread,
  createMessage,
  listMessages,
  createAndPoll,
} = require("../controllers/openaiConversationController");

const router = express.Router();

router.get("/assistant/create", createAssistant);
router.get("/assistant/:id", retrieveAssistant);
router.post("/threads", createThread);
router.post("/threads/:id/messages", createMessage);
router.get("/threads/:id/messages", listMessages);
router.post("/poll", createAndPoll);

module.exports = router;
