import { NextResponse, type NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

async function uploadFileToS3(fileBuffer: Buffer, fileName: string) {
  const key = `${fileName}-${Date.now()}`;

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

    if (!file || !(file instanceof File)) {
      throw new Error("File blob is required");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { key } = await uploadFileToS3(fileBuffer, file.name);

    return NextResponse.json({ key }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
