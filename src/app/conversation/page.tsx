"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  createConversation,
  continueConversation,
  pollConversation,
} from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { saveProgress } from "@/lib/api";
import { saveMatches } from "../../lib/api";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
}

interface UpdatedMessage {
  id: any;
  role: any;
  content: { text: { value: string } }[];
}

type User = {
  email: string | null;
  lastProgress: string | null;
  matches: Array<{
    content_title: string;
    content_age_group: Array<string>;
    content_category: Array<string>;
    content_difficulty: string;
    content_time_factor: string;
  }>;
};
export default function Chatbox() {
  const router = useRouter();
  const assistantId = "asst_9DakH8RzF7IQzdtvrLCEVk57";
  const [threadId, setThreadId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkRecord = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedData = JSON.parse(userData);

        if (!parsedData.matches) {
          router.push("/");
        }
      }
    };
    checkRecord();
  }, []);

  useEffect(() => {
    handleCreateConversation();
  }, []);

  const handleCreateConversation = async () => {
    setIsInitializing(true);

    const user: User | null = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const thread = await createConversation();
    setThreadId(thread.id);

    const initialMessage = `Hello! How can I assist you today? Here's some context: ${
      user?.lastProgress ?? "No recent activity."
    }. Matches: ${
      user?.matches
        ?.map((match) => {
          const {
            content_title,
            content_age_group,
            content_category,
            content_difficulty,
            content_time_factor,
          } = match;
          return `Title: ${content_title}, Age Group: ${content_age_group.join(", ")}, Category: ${content_category.join(", ")}, Difficulty: ${content_difficulty}, Time Factor: ${content_time_factor}`;
        })
        .join(", ") ?? "No matches available."
    }`;

    await continueConversation(thread.id, "assistant", initialMessage);
    const updatedMessages = await pollConversation(assistantId, thread.id);

    const mappedMessages = updatedMessages
      .map(
        (item: {
          id: any;
          role: any;
          content: { text: { value: any } }[];
        }) => ({
          id: item.id,
          text: item.content[0].text.value,
          sender: item.role === "user" ? "user" : "assistant",
        })
      )
      .reverse()
      .slice(1);
    setMessages(mappedMessages);

    setIsInitializing(false);
  };

  const handleContinueConversation = async () => {
    if (!threadId || !inputValue.trim()) return;
    const userMessage: Message = {
      id: uuidv4(),
      text: inputValue.trim(),
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const user: User | null = JSON.parse(
        localStorage.getItem("user") || "null"
      );
      const email = user ? user.email || "" : "";
      await Promise.all([
        continueConversation(threadId, "user", userMessage.text),
        saveProgress(email, userMessage.text),
      ]);

      const updatedMessages = await pollConversation(assistantId, threadId);
      processUpdatedMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const processUpdatedMessages = (updatedMessages: UpdatedMessage[]) => {
    const matches = safeJSONParse(updatedMessages[0].content[0].text.value, []);
    if (matches.suggestions) {
      saveMatches(matches.suggestions);
    }

    const mappedMessages = updatedMessages.map(mapMessage).reverse().slice(1);
    setMessages(mappedMessages);
  };

  const safeJSONParse = (str: string, defaultValue: any) => {
    try {
      return JSON.parse(str);
    } catch {
      return defaultValue;
    }
  };

  const mapMessage = (item: UpdatedMessage): Message => {
    let textValue = item.content[0].text.value;

    const parsedResponse = safeJSONParse(textValue, {});
    if (parsedResponse.response && parsedResponse.suggestions) {
      const suggestions = parsedResponse.suggestions
        .map((s: any) => `• ${s.content_title} ${s.content_link}`)
        .join("\n");
      textValue = `${parsedResponse.response}\n${suggestions}`;
    } else {
      textValue = textValue
        .replace(/- /g, "• ")
        .replace(/(https?:\/\/[^\s]+)/g, "\n$1");
    }

    return {
      id: item.id,
      text: textValue,
      sender: item.role === "user" ? "user" : "assistant",
    };
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const createLinkifiedText = (text: string) => {
    if (!text) return "";

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" style="color: #007bff; text-decoration: none;" target="_blank" rel="noopener noreferrer">[Document Link]</a>`
    );
  };

  return (
    <div className="w-full max-w-md mx-auto border rounded-lg overflow-hidden shadow-lg">
      <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
        {isInitializing ? (
          <div className="flex justify-center items-center h-full w-full text-gray-800">
            <div className="flex">
              <Spinner />
            </div>
            <span className="ml-2">Initializing...</span>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                } whitespace-pre-line`}
                dangerouslySetInnerHTML={{
                  __html: createLinkifiedText(message.text),
                }}
              />
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left mb-4 animate-pulse text-gray-800">
            <span className="bg-gray-200 inline-block p-2 rounded-lg">
              • • •
            </span>
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-4 flex">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleContinueConversation();
            }
          }}
          placeholder="Type a message..."
          className="flex-grow mr-2"
          disabled={isInitializing}
        />
        <Button
          onClick={handleContinueConversation}
          disabled={isInitializing || !threadId || isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
