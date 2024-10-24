import clientPromise from "@/lib/mongodb";

export const saveProgress = async (email: string, progress: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");

    await db
      .collection("users")
      .updateOne(
        { email },
        { $set: { lastProgress: progress, updatedAt: new Date() } },
        { upsert: true }
      );
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
};

export const saveMatches = async (email: string, matches: object) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");

    await db
      .collection("users")
      .updateOne(
        { email },
        { $set: { matches: matches, updatedAt: new Date() } },
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
    const userProgress = await db.collection("users").findOne({ email });
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
