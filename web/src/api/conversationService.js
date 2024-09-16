import axios from "axios";

const BASE_URL = "http://localhost:5000/api/conversation";

const createAssistant = async (assistant_id) => {
  const response = await axios.get(`${BASE_URL}/assistant/${assistant_id}`);
  return response.data;
};

const createConversation = async () => {
  const response = await axios.post(`${BASE_URL}/threads`);
  return response.data;
};

const pollConversation = async (assistant_id, thread_id) => {
  const response = await axios.post(`${BASE_URL}/poll`, {
    assistant_id,
    thread_id,
  });
  return response.data;
};

const continueConversation = async (thread_id, messages) => {
  const response = await axios.post(
    `${BASE_URL}/threads/${thread_id}/messages`,
    {
      messages,
    }
  );
  return response.data;
};

const listMessages = async (thread_id) => {
  const response = await axios.get(`${BASE_URL}/threads/${thread_id}/messages`);
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
  createAssistant,
  createConversation,
  pollConversation,
  continueConversation,
  listMessages,
  confirmOrRejectToolRun,
};
