import clientPromise from "@/lib/mongodb";

interface Message {
  content: string;
  role: string;
}

interface ContentMatch {
  content_title: string;
  content_age_group: Array<string>;
  content_category: Array<string>;
  content_difficulty: string;
  content_time_factor: "short" | "medium" | "long";
  content_link: string;
}

interface UserDocument {
  _id: string;
  email: string;
  last_progress: string;
  matches: ContentMatch[];
  updatedAt: Date;
  lastProgress: string;
}

export const saveConversation = async (
  threadId: string,
  message: Message,
  email: string
) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");

    const existingThread = await db
      .collection("conversations")
      .findOne({ id: threadId });

    const currentUser = await db.collection("users").findOne({ email });

    if (existingThread) {
      await db.collection("conversations").updateOne(
        { id: threadId },
        {
          $push: {
            conversation: message as any, // TypeScript workaround
          },
        }
      );
    } else {
      const newConversation = await db.collection("conversations").insertOne({
        id: threadId,
        parentUser: currentUser?._id,
        conversation: [message],
        date: new Date(),
      });

      await db
        .collection<UserDocument>("users")
        .updateOne(
          { email },
          { $push: { conversations: newConversation.insertedId } }
        );
    }
  } catch (error) {
    console.error("Failed to save conversation:", error);
  }
};
