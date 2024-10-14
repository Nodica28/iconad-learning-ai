export const registerUser = async (email: string) => {
  const res = await fetch(`/api/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    const errorMessage = errorData.error || "Failed to register.";
    throw new Error(errorMessage);
  }

  return res.json();
};

export const loginUser = async (email: string) => {
  const res = await fetch(`/api/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Failed to login.");
  }

  return res.json();
};

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

export const fileUpload = async (fileData: FormData) => {
  const fileSizeLimit = 5 * 1024 * 1024; // 5MB size limit

  // Find file entry in formData
  const fileEntry = Array.from(fileData.entries()).find(
    ([key]) => key === "file"
  );

  if (
    fileEntry &&
    fileEntry[1] instanceof File &&
    fileEntry[1].size > fileSizeLimit
  ) {
    throw new Error(
      "File size exceeds 5MB limit. Please choose a smaller file."
    );
  }

  const res = await fetch(`/api/upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: fileData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload the file.");
  }

  return res.json();
};
