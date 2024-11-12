import clientPromise from "@/lib/mongodb";

export const saveMaterialToDatabase = async (material: Record<string, any>) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const collection = db.collection("materials");

    // Add a timestamp to the material
    material.timestamp = new Date();

    // Insert the material into the collection
    await collection.insertOne(material);

    console.log("Material saved successfully with timestamp.");
  } catch (error) {
    console.error("Failed to save material:", error);
  }
};

export const getMaterialsFromDatabase = async (email: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const user = await db.collection("users").findOne({ email });
    if (user) {
      const materials = await db.collection("materials").find().toArray();
      return materials;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to get materials:", error);
    return null;
  }
};
