import axios from "axios";

const BASE_URL = "http://localhost:5000/api/conversation";

const createConversation = async (agent_id, message) => {
  const response = await axios.post(`${BASE_URL}/create`, {
    agent_id,
    message,
  });
  return response.data;
};

const pollConversation = async (studioId, jobId) => {
  const response = await axios.get(`${BASE_URL}/poll/${studioId}/${jobId}`);
  return response.data;
};

const continueConversation = async (agent_id, conversation_id, message) => {
  const response = await axios.post(`${BASE_URL}/continue`, {
    agent_id,
    conversation_id,
    message,
  });
  return response.data;
};

const listMessages = async (conversation_id) => {
  const response = await axios.post(`${BASE_URL}/list`, {
    conversation_id,
  });
  return response.data;
};

const confirmOrRejectToolRun = async (
  agent_id,
  conversation_id,
  action,
  action_request_id
) => {
  const response = await axios.post(`${BASE_URL}/confirm`, {
    agent_id,
    conversation_id,
    action,
    action_request_id,
  });
  return response.data;
};

export {
  createConversation,
  pollConversation,
  continueConversation,
  listMessages,
  confirmOrRejectToolRun,
};
