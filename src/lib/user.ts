import clientPromise from "@/lib/mongodb";

export const login = async (email: string) => {
  try {
    let user;
    const client = await clientPromise;
    const db = client.db("userDB");
    const collection = db.collection("users");

    let existingUser = await collection.findOne({ email });

    if (!existingUser) {
      user = { authenticated: false };
    } else {
      user = { ...existingUser, authenticated: true };
    }

    return user;
  } catch (error) {
    console.error("Error checking email in database:", error);
    throw error;
  }
};

export const register = async (email: string): Promise<void> => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const collection = db.collection("users");

    // Check if the email already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists.");
    }

    // Create a new user
    await collection.insertOne({ email });
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const retrieveInfo = async (email: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const collection = db.collection("users");

    const userInfo = await collection.findOne({ email });

    if (!userInfo) {
      throw new Error("User not found.");
    }

    return userInfo;
  } catch (error) {
    console.error("Error retrieving user information:", error);
    throw error;
  }
};
