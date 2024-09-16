const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

exports.createAssistant = async (req, res) => {
  try {
    const assistant = await openai.beta.assistants.create({
      assistant_id: "asst_ieqJPDjvu7bBByZCTIFzXW5Q",
      messages: [
        { role: "user", content: "Hello! How can you assist me today?" },
      ],
      model: "gpt-4o",
    });
    res.json(assistant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.retrieveAssistant = async (req, res) => {
  try {
    const assistantId = req.params.id;
    const myAssistant = await openai.beta.assistants.retrieve(assistantId);
    res.json(myAssistant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createThread = async (req, res) => {
  try {
    const messageThread = await openai.beta.threads.create();
    res.json(messageThread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const threadId = req.params.id;
    const { messages } = req.body;

    const threadMessages = await openai.beta.threads.messages.create(
      threadId,
      messages
    );
    res.json(threadMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listMessages = async (req, res) => {
  try {
    const threadId = req.params.id;
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    res.json(threadMessages.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAndPoll = async (req, res) => {
  try {
    const { thread_id, assistant_id } = req.body;

    let run = await openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistant_id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      res.json(messages);
    } else {
      res.status(202).json({ status: run.status });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
