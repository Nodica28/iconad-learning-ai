import clientPromise from "@/lib/mongodb";

interface Message {
  content: string;
  role: string;
}

export const saveConversation = async (threadId: string, message: Message) => {
  try {
    const client = await clientPromise;
    const db = client.db("chatDB");

    const existingThread = await db
      .collection("conversations")
      .findOne({ id: threadId });

    if (existingThread) {
      // Update the existing conversation
      await db.collection("conversations").updateOne(
        { id: threadId },
        {
          $push: {
            conversation: message as any, // TypeScript workaround
          },
        }
      );
    } else {
      // Create a new conversation document
      await db.collection("conversations").insertOne({
        id: threadId,
        conversation: [message],
        date: new Date(),
      });
    }
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
};
