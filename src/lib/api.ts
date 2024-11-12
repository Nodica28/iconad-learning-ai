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

export const getUserData = async () => {
  const user = localStorage.getItem("user");
  if (!user) {
    throw new Error("No user found in localStorage.");
  }

  const { email } = JSON.parse(user);

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new Error("Email is not a valid string.");
  }
  const res = await fetch(`/api/user/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error("Failed to get user data.");
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
  content: any
) => {
  const user = localStorage.getItem("user");
  if (!user) {
    throw new Error("No user found in localStorage.");
  }

  const { email } = JSON.parse(user);

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new Error("Email is not a valid string.");
  }
  const res = await fetch(`/api/thread/${threadId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threadId, role, content, email }),
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
  const user = localStorage.getItem("user");
  if (!user) {
    throw new Error("No user found in localStorage.");
  }

  const { email } = JSON.parse(user);

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new Error("Email is not a valid string.");
  }
  const res = await fetch(`/api/poll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistant_id: assistantId,
      thread_id: threadId,
      email,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to poll the conversation.");
  }
  return res.json();
};

export const saveProgress = async (email: string, progress: string) => {
  const res = await fetch(`/api/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, progress }),
  });
  if (!res.ok) {
    throw new Error("Failed to save progress.");
  }
  return res.json();
};

export const saveMatches = async (matches: object) => {
  const user = localStorage.getItem("user");
  if (!user) {
    throw new Error("No user found in localStorage.");
  }

  const { email } = JSON.parse(user);

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new Error("Email is not a valid string.");
  }
  const res = await fetch(`/api/matches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, matches }),
  });
  if (!res.ok) {
    throw new Error("Failed to save progress.");
  }
  return res.json();
};

export const analyzeFile = async (fileData: FormData) => {
  const fileSizeLimit = 20 * 1024 * 1024; // 5MB size limit

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
      "File size exceeds 20MB limit. Please choose a smaller file."
    );
  }

  const res = await fetch(`/api/analyze`, {
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

export const saveMaterial = async (fileData: FormData) => {
  const fileSizeLimit = 20 * 1024 * 1024; // 5MB size limit

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
      "File size exceeds 20MB limit. Please choose a smaller file."
    );
  }

  const res = await fetch(`/api/store`, {
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

export const getMaterials = async () => {
  const user = localStorage.getItem("user");
  if (!user) {
    throw new Error("No user found in localStorage.");
  }

  const { email } = JSON.parse(user);

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new Error("Email is not a valid string.");
  }

  const res = await fetch(`/api/store?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch materials.");
  }
  return res.json();
};
