import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import openai from "@/lib/openai";
import { uploadPrompt } from "@/constants/uploadPrompt";

const vectorId = process.env.VECTOR_ID;
const assistantId = process.env.FILE_ANALYZER_ASSISTANT_ID;

async function processPdfFile(file: File): Promise<string> {
  if (!vectorId || !assistantId) {
    throw new Error("IDs are not defined.");
  }

  await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorId, {
    files: [file],
  });

  const vectorStoreFiles = await openai.beta.vectorStores.files.list(vectorId);

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: "Analyze this file for me.",
        attachments: [
          {
            file_id: vectorStoreFiles.data[0].id,
            tools: [{ type: "file_search" }],
          },
        ],
      },
    ],
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  });

  const messages = await openai.beta.threads.messages.list(run.thread_id);
  let analysisResult = "";
  if (
    messages.data &&
    messages.data[0] &&
    "text" in messages.data[0].content[0]
  ) {
    analysisResult = messages.data[0].content[0].text.value
      .replace(/```json|```/g, "")
      .trim();
  }

  await openai.files.del(vectorStoreFiles.data[0].id);
  await openai.beta.vectorStores.files.del(
    vectorId,
    vectorStoreFiles.data[0].id
  );

  return analysisResult;
}

async function resizeImageIfNeeded(imageBuffer: Buffer): Promise<string> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  let processedImage = image;
  if (
    (metadata.width && metadata.width > 2048) ||
    (metadata.height && metadata.height > 2048)
  ) {
    processedImage = image.resize({
      width: 2048,
      height: 2048,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    });
  }

  const processedImageBuffer = await processedImage.toFormat("jpeg").toBuffer();
  return Buffer.from(processedImageBuffer).toString("base64");
}

async function analyzeImage(dataUrl: string) {
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: uploadPrompt,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${dataUrl}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any,
    max_tokens: 1500,
    temperature: 0.1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let content = response.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");

  return content.replace(/```json|```/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    let analysisResult;

    if (!file || !(file instanceof File)) {
      throw new Error("File is missing or invalid");
    }

    if (file.type.startsWith("image/")) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const dataUrl = await resizeImageIfNeeded(fileBuffer);
      analysisResult = await analyzeImage(dataUrl);
    } else {
      analysisResult = await processPdfFile(file);
    }

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
