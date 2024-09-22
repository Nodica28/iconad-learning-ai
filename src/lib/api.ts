export const createConversation = async () => {
  const res = await fetch(`/api/thread`, { method: "POST" });
  if (!res.ok) {
    throw new Error("Failed to create a thread.");
  }
  return res.json();
};

export const continueConversation = async (threadId: string, messages: any) => {
  const res = await fetch(`/api/thread/?id=${threadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    throw new Error("Failed to continue the conversation.");
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
