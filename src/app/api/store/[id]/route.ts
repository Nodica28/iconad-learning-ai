import { NextResponse, type NextRequest } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  deleteMaterialFromDatabase,
  updateMaterialInDatabase,
} from "@/lib/store";

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

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

export async function GET(req: NextRequest) {
  const url = new URL(req.url); // Correct parsing of the URL
  const id = url.pathname.split("/").pop(); // Extract ID from URL

  // Ensure id is valid
  if (!id) {
    return NextResponse.json(
      { error: "Invalid or missing ID parameter" },
      { status: 400 }
    );
  }

  try {
    const getObjectParams = {
      Bucket: bucketName,
      Key: id,
    };

    const command = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json({ presignedUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to get presigned URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Invalid or missing ID parameter" },
      { status: 400 }
    );
  }

  try {
    // MongoDB: Delete document and retrieve it
    const material = await deleteMaterialFromDatabase(id);

    // S3: Delete file
    const documentLinkKey = material.document_link;
    const deleteObjectParams = {
      Bucket: bucketName,
      Key: documentLinkKey,
    };

    await s3Client.send(new DeleteObjectCommand(deleteObjectParams));

    return NextResponse.json(
      { message: "Material deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to delete material:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const id = req.url.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Invalid or missing ID parameter" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const updatedMaterial = await updateMaterialInDatabase(id, body);

    return NextResponse.json(
      { message: "Material updated successfully.", material: updatedMaterial },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to update material:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
