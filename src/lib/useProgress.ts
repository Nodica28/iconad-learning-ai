import clientPromise from "@/lib/mongodb";

interface Progress {
  // Define the structure to store progress information
}

export const saveProgress = async (email: string, progress: Progress) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");

    await db
      .collection("userProgress")
      .updateOne(
        { email },
        { $set: { lastProgress: progress, updatedAt: new Date() } },
        { upsert: true }
      );
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
};

export const getProgress = async (email: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const userProgress = await db.collection("userProgress").findOne({ email });
    if (userProgress && userProgress.lastProgress) {
      return userProgress.lastProgress;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to get progress:", error);
    return null;
  }
};
