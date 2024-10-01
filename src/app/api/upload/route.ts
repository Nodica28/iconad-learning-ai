import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import openai from "@/lib/openai";

async function analyzeImage(imageBuffer: Buffer) {
  const dataUrl = await resizeImageIfNeeded(imageBuffer);

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: 'You will be given an image file, your job will be to extract the following in JSON format:\n\n{"Name": "", "Email": "", "Phone Number": "", "Home Address": "", "Summary": "", "Tag": ""}\n\n1. Name\n2. Email\n3. Phone Number (Optional)\n4. Home Address (Optional)\n5. Summary of the CV (No more than 1 paragraph)\n6. Tag( "live in" or a "care worker")\n\nFor the summary, focus more on years of experience and what work they had in the past. For tagging, decide whether they are best as a "live in" or a "care worker" based on the experience. If you did not receive an image reply NO IMAGE RECEIVED.',
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      max_tokens: 900,
      temperature: 0.1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    let content = response.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Received empty or invalid response from OpenAI");
    }

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Check if content is valid JSON
    if (content.startsWith("{") && content.endsWith("}")) {
      try {
        return JSON.parse(content);
      } catch (e) {
        return { error: "Error parsing JSON response from OpenAI" };
      }
    }

    // If the content is not JSON, return it as an error message
    return { error: content };
  } catch (error: any) {
    return { error: `Error from OpenAI: ${error.message}` };
  }
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

  // Convert to one of the supported formats (e.g., jpeg)
  const processedImageBuffer = await processedImage.toFormat("jpeg").toBuffer();
  return Buffer.from(processedImageBuffer).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new Error("File is missing or invalid");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const analysisResult = await analyzeImage(fileBuffer);

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
