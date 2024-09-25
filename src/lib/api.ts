export const createAssistant = async (
  instructions: string,
  name: string,
  model: string
) => {
  const res = await fetch(`/api/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ instructions, name, model }),
  });
  if (!res.ok) {
    throw new Error("Failed to create an assistant.");
  }
  return res.json();
};

export const createConversation = async () => {
  const res = await fetch(`/api/thread`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to create a thread.");
  }
  return res.json();
};

export const continueConversation = async (
  threadId: string,
  role: string,
  messages: any
) => {
  const res = await fetch(`/api/thread/${threadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threadId, role, messages }),
  });
  if (!res.ok) {
    throw new Error("Failed to continue the conversation.");
  }
  return res.json();
};

export const listMessages = async (threadId: string) => {
  const res = await fetch(`/api/thread/messages?id=${threadId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to list messages.");
  }
  return res.json();
};

export const pollConversation = async (
  assistantId: string,
  threadId: string
) => {
  const res = await fetch(`/api/poll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assistant_id: assistantId, thread_id: threadId }),
  });
  if (!res.ok) {
    throw new Error("Failed to poll the conversation.");
  }
  return res.json();
};
