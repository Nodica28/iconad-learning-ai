import React, { useState, useEffect } from "react";
import {
  createAssistant,
  createConversation,
  continueConversation,
  listMessages,
  pollConversation,
} from "../../api/conversationService";

const Conversation = () => {
  const agentId = "asst_ieqJPDjvu7bBByZCTIFzXW5Q";
  const [threadId, setThreadId] = useState(null);
  const [assistantId, setAssistantId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleCreateConversation = async () => {
    const assistant = await createAssistant(agentId);
    const thread = await createConversation();
    setAssistantId(assistant.id);
    setThreadId(thread.id);
  };

  const handleContinueConversation = async () => {
    const message = {
      role: "user",
      content: `{"Basic Information":{"What is your child's age?":"age_2_to_3"},"Communication and Language":{"How would you describe your child's communication skills?":"developing","Which communication-related activities does your child enjoy?":"learning_new_words"},"Physical Development":{"What types of physical activities does your child enjoy the most?":"hand_eye_coordination_games","Is your child more interested in:":"indoor_activities"},"Personal, Social, and Emotional Development":{"How does your child prefer to play?":"mix_of_both","Does your child enjoy activities that encourage social interactions and sharing?":"sometimes"},"Literacy":{"How interested is your child in literacy-related activities?":"somewhat_interested","What literacy activities does your child enjoy?":"listening_to_stories"},"Mathematics":{"What math-related activities does your child enjoy?":"counting_objects","How comfortable is your child with early math skills?":"just_starting"},"Understanding the World":{"What aspects of the world is your child most curious about?":"nature_and_animals","Does your child enjoy exploring their surroundings (indoors and outdoors)?":"yes"},"Expressive Arts and Design":{"How does your child express themselves creatively?":"drawing_or_painting","What creative activities does your child prefer?":"drawing_or_crafting"},"Interest-Based Questions":{"What are your child's favorite topics or interests?":"vehicles"},"Content Type Preferences":{"What type of content does your child prefer?":"videos"},"Learning Objectives":{"Which areas of development would you like to focus on?":"memory_and_recognition"},"Engagement and Focus":{"How long can your child typically engage with a single activity?":"more_than_10_minutes","What level of focus does your child typically need to enjoy an activity?":"moderate_focus_required","Do you prefer activities that require parental guidance?":"yes"},"Difficulty and Skill Level":{"How would you describe your child's current skill level in learning new things?":"beginner"},"Special Needs and Considerations":{"Does your child have any special needs or considerations we should be aware of?":"special_educational_needs"},"Seasonal or Thematic Preferences":{"Does your child enjoy content related to seasons or holidays?":"holiday_themed"}}`,
    };
    await continueConversation(threadId, message);
    const response = await pollConversation(assistantId, threadId);
    console.log(response);

    handleListMessages();
  };

  const handleListMessages = async () => {
    const response = await listMessages(threadId);
    const mappedMessages = response.map((item) => ({
      id: item.id,
      role: item.role,
      content: item.content[0].text.value,
    }));
    setMessages(mappedMessages);
  };

  return (
    <div>
      <h1>Conversation</h1>
      <button onClick={handleCreateConversation}>Start Conversation</button>
      <button onClick={handleListMessages}>List Messages</button>
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <button onClick={handleContinueConversation}>Send Message</button>
      <div>
        {messages.map((msg: { content: string }, index: number) => (
          <div key={index}>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Conversation;
