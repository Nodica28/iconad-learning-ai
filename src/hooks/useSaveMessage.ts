import { useState } from "react";
import clientPromise from "@/lib/mongodb";

interface Message {
  content: string;
  sender: string;
  timestamp: Date;
}

export function useSaveMessage() {
  const [saving, setSaving] = useState(false);

  const saveMessage = async (message: Message) => {
    setSaving(true);
    try {
      const client = await clientPromise;
      const db = client.db("chatDB");
      await db.collection("messages").insertOne(message);
    } catch (error) {
      console.error("Failed to save message:", error);
    } finally {
      setSaving(false);
    }
  };

  return { saveMessage, saving };
}
