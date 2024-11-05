import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import openai from "@/lib/openai";

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
          text: 'You will be provided with a file that contains learning materials for children. Your main job is to analyze and decide the best answers that best describe the learning material. Your output will always mirror this format: { "ageGroup": { "description": "Used to determine the child\'s current age range for appropriate activity recommendations.", "value": "" }, "communicationAndLanguage": { "description": "Used to assess the child\'s communication abilities, from emerging to confident language skills. Also helps identify which communication-related activities the child enjoys, such as listening to stories or engaging in conversations.", "value": { "languageSkills": "", "preferredActivities": [] } }, "physicalDevelopment": { "description": "Used to explore the child\'s preferences for physical activities, such as running, jumping, or fine motor skill tasks like drawing. Helps identify whether the child prefers outdoor play or indoor activities like puzzles and building blocks.", "value": { "physicalActivities": [], "preference": "indoor/outdoor" } }, "personalSocialEmotionalDevelopment": { "description": "Used to understand the child\'s social behavior and play preferences, whether they enjoy playing independently, with others, or both. Also evaluates the child\'s interest in social interaction and sharing activities.", "value": { "playPreference": "independent/with others/both", "socialInteraction": "" } }, "literacy": { "description": "Used to evaluate the child\'s interest in literacy-related activities, such as alphabet recognition, phonics, or story comprehension. Helps identify which literacy activities the child enjoys, including learning to write letters or listening to stories.", "value": { "literacyInterest": [], "preferredActivities": [] } }, "mathematics": { "description": "Used to explore the child\'s preferences for math-related activities, including counting, recognizing shapes, or solving simple puzzles. Helps assess the child\'s comfort level with early math skills, from beginner to advanced.", "value": { "mathPreferences": [], "skillLevel": "beginner/intermediate/advanced" } }, "understandingTheWorld": { "description": "Used to determine the child\'s curiosity about the world, including topics like nature, communities, technology, and seasons. Evaluates whether the child enjoys exploring their surroundings, indoors or outdoors.", "value": { "interests": [], "explorationPreference": "indoors/outdoors/both" } }, "expressiveArtsAndDesign": { "description": "Used to understand how the child expresses creativity, whether through drawing, music, pretend play, or building structures. Identifies the child\'s preferred creative activities, such as crafting or role-playing.", "value": { "creativeExpression": [], "preferredActivities": [] } }, "interestBasedQuestions": { "description": "Used to explore the child\'s favorite topics or interests, including animals, vehicles, space, or fairytales.", "value": { "favoriteTopics": [] } }, "contentTypePreferences": { "description": "Used to identify the child\'s preferred learning content format, whether they enjoy videos, interactive games, stories, puzzles, or hands-on activities.", "value": { "contentFormats": [] } }, "learningObjectives": { "description": "Used to determine the developmental areas you would like to focus on for the child, such as social skills, problem-solving, or language fluency.", "value": { "objectives": [] } }, "engagementAndFocus": { "description": "Used to assess the child\'s attention span and level of focus required to engage in activities, helping to tailor the difficulty and duration of activities. Also evaluates whether parental guidance is preferred or if the child enjoys independent activities.", "value": { "attentionSpan": "", "guidancePreference": "parental/independent" } }, "difficultyAndSkillLevel": { "description": "Used to gauge the child’s current skill level in learning new things, whether they are a beginner, intermediate, or advanced learner.", "value": { "skillLevel": "beginner/intermediate/advanced" } }, "specialNeedsAndConsiderations": { "description": "Used to account for any special educational or sensory needs the child may have, such as sensory-friendly content or support for motor skill difficulties.", "value": { "specialNeeds": [] } }, "seasonalOrThematicPreferences": { "description": "Used to determine if the child enjoys content related to seasonal themes or holidays, helping to tailor activities to their interests.", "value": { "seasonalThemes": [] } } } Your only output is the JSON file and nothing else, do not explain your answer.',
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
