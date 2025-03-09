import { NextResponse, type NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { saveMaterialToDatabase, getMaterialsFromDatabase } from "@/lib/store";
import { v4 as uuidv4 } from "uuid";

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS configuration environment variables");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

interface Material {
  title: string;
  age_group: string[];
  developmental_areas: string[];
  learning_objective_tags: string[];
  interest_tags: string[];
  content_type: string[];
  engagement_level: string[];
  duration: string;
  skill_level: "beginner" | "intermediate" | "advanced";
  document_link?: string;
}

async function uploadFileToS3(fileBuffer: Buffer, fileName: string) {
  const fileExtension = fileName.substring(fileName.lastIndexOf("."));
  const uniqueId = uuidv4();
  const key = `${uniqueId}-${Date.now()}${fileExtension}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return { key };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const materialStr = formData.get("material");

    if (!file || !(file instanceof File)) {
      throw new Error("File blob is required");
    }

    // Parse the material JSON string to a Material object
    let material: Material;
    if (typeof materialStr === "string") {
      material = JSON.parse(materialStr);
    } else {
      throw new Error("Material is required and must be a valid JSON string");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { key } = await uploadFileToS3(fileBuffer, file.name);

    // Add or update the document_link in the material object
    material.document_link = key;

    // Here you might want to save the updated material object to a database

    await saveMaterialToDatabase(material);

    // If you want to send the updated material object back in the response:
    return NextResponse.json({ material }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      throw new Error("Email is required");
    }
    const materials = await getMaterialsFromDatabase(email);
    return NextResponse.json({ materials }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
