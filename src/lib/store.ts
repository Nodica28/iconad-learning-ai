import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

export const deleteMaterialFromDatabase = async (id: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("userDB");
    const materialsCollection = db.collection("materials");

    // Find the document to retrieve the document_link
    const material = await materialsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!material) {
      throw new Error("Document not found");
    }

    // Remove document
    await materialsCollection.deleteOne({ _id: new ObjectId(id) });

    return material; // Return the deleted material
  } catch (error) {
    console.error("Failed to delete material from database:", error);
    throw error;
  }
};

export async function updateMaterialInDatabase(id: string, updateData: any) {
  const client = await clientPromise;
  await client.connect();
  const database = client.db("userDB");
  const materialsCollection = database.collection("materials"); // Replace with your collection name

  const filter = { _id: new ObjectId(id) };
  const { _id, ...updateDocument } = updateData;

  const result = await materialsCollection.updateOne(filter, {
    $set: updateDocument,
  });

  if (result.matchedCount === 0) {
    throw new Error("Material not found.");
  }

  return { id };
}
