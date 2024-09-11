import React, { useState, useEffect } from "react";
import {
  createConversation,
  pollConversation,
  continueConversation,
  listMessages,
  confirmOrRejectToolRun,
} from "../../api/conversationService";

const Conversation = () => {
  const [agentId, setAgentId] = useState(
    "46625438-b2a3-41fe-ae96-a4bc0d0eb4ed"
  );
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleCreateConversation = async () => {
    const message = { role: "user", content: "Hello" };
    const response = await createConversation(agentId, message);
    console.log(response);

    setConversationId(response.conversation_id);
    pollForUpdates(response.job_info.studio_id, response.job_info.job_id);
  };

  const pollForUpdates = async (studioId, jobId) => {
    const response = await pollConversation(studioId, jobId);
    setMessages(response.updates);
  };

  const handleContinueConversation = async () => {
    const message = { role: "user", content: inputMessage };
    const response = await continueConversation(
      agentId,
      conversationId,
      message
    );
    handleListMessages();
  };

  const handleListMessages = async () => {
    const response = await listMessages(conversationId);
    const mappedMessages = response.map((item) => item.data.message);
    console.log(mappedMessages);
    setMessages(mappedMessages);
  };

  const handleConfirmOrReject = async (action, actionRequestId) => {
    const response = await confirmOrRejectToolRun(
      agentId,
      conversationId,
      action,
      actionRequestId
    );
    setMessages((prevMessages) => [...prevMessages, response] as never[]);
  };

  return (
    <div>
      <h1>Conversation</h1>
      <button onClick={handleCreateConversation}>Start Conversation</button>
      <button onClick={handleListMessages}>List Messages</button>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <button onClick={handleContinueConversation}>Send Message</button>
      <div>
        {messages.map((msg: { content: string }, index: number) => (
          <div key={index}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Conversation;
