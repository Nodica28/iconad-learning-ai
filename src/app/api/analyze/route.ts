import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import openai from "@/lib/openai";
import { uploadPrompt } from "@/constants/uploadPrompt";

const assistantId = process.env.FILE_ANALYZER_ASSISTANT_ID;

async function processPdfFile(file: File): Promise<string> {
  if (!assistantId) {
    throw new Error("Assistant ID is not defined.");
  }

  // Upload the file to OpenAI
  const fileUploadResponse = await openai.files.create({
    file: file,
    purpose: "assistants",
  });

  // Create a thread with the file attached
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: "Analyze this file for me.",
        attachments: [
          {
            file_id: fileUploadResponse.id,
            tools: [{ type: "file_search" }],
          },
        ],
      },
    ],
  });

  // Run the assistant on the thread
  await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistantId,
  });

  // Get the assistant's response
  const messages = await openai.beta.threads.messages.list(thread.id, {
    order: "desc",
    limit: 1,
  });

  let analysisResult = "";
  if (
    messages.data &&
    messages.data.length > 0 &&
    messages.data[0].content &&
    messages.data[0].content.length > 0 &&
    "text" in messages.data[0].content[0]
  ) {
    analysisResult = messages.data[0].content[0].text.value
      .replace(/```json|```/g, "")
      .trim();
  } else {
    throw new Error("Unable to retrieve analysis results from OpenAI");
  }

  // Clean up by deleting the file
  await openai.files.del(fileUploadResponse.id);

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
    console.error("Error processing file:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
