const axios = require("axios");

const BASE_URL = `https://api-${process.env.REGION}.stack.tryrelevance.com/latest`;
const HEADERS = {
  Authorization: `${process.env.PROJECT_ID}:${process.env.API_KEY}`,
};

exports.createConversation = async (req, res) => {
  const { agent_id, message } = req.body;
  try {
    const response = await axios.post(
      `${BASE_URL}/agents/trigger`,
      {
        message,
        agent_id,
      },
      { headers: HEADERS }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.pollConversation = async (req, res) => {
  const { studioId, jobId } = req.params;
  try {
    const response = await axios.get(
      `${BASE_URL}/studios/${studioId}/async_poll/${jobId}`,
      { headers: HEADERS }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.continueConversation = async (req, res) => {
  const { agent_id, conversation_id, message } = req.body;
  try {
    const response = await axios.post(
      `${BASE_URL}/agents/trigger`,
      {
        message,
        agent_id,
        conversation_id,
      },
      { headers: HEADERS }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listMessages = async (req, res) => {
  const { conversation_id } = req.body;
  try {
    const response = await axios.post(
      `${BASE_URL}/knowledge/list`,
      {
        knowledge_set: conversation_id,
        page_size: 20,
        sort: [{ insert_date_: "desc" }],
      },
      { headers: HEADERS }
    );
    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmOrRejectToolRun = async (req, res) => {
  const { agent_id, conversation_id, action, action_request_id } = req.body;
  try {
    const response = await axios.post(
      `${BASE_URL}/agents/trigger`,
      {
        message: {
          role: action === "confirm" ? "action-confirm" : "action-reject",
          action,
          action_request_id,
        },
        agent_id,
        conversation_id,
      },
      { headers: HEADERS }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
