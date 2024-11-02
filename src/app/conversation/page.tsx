"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  createConversation,
  continueConversation,
  listMessages,
  pollConversation,
} from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { saveProgress } from "@/lib/api";
import { getUserData } from "../../lib/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function Chatbox() {
  const assistantId = "asst_9DakH8RzF7IQzdtvrLCEVk57";
  const [threadId, setThreadId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false); // New state for initialization

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleCreateConversation();
  }, []);

  const handleCreateConversation = async () => {
    setIsInitializing(true);

    const response = await getUserData();

    const thread = await createConversation();
    setThreadId(thread.id);

    const initialMessage = `Hello! How can I assist you today? Here's some context: ${response.last_progress || "No recent activity."}. Matches: ${response.matches.map((match: { content_time_factor: any; content_tag: any }) => `Time Factor: ${match.content_time_factor}, Tag: ${match.content_tag}`).join(", ")}`;

    await continueConversation(thread.id, "assistant", initialMessage);
    await pollConversation(assistantId, thread.id);

    const updatedMessages = await listMessages(thread.id);

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
    if (!threadId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");

    const role = "user";

    const email = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!).email || ""
      : "";

    setIsLoading(true); // Set loading state to true

    await continueConversation(threadId, role, userMessage.text);
    await pollConversation(assistantId, threadId);
    saveProgress(email, userMessage.text);

    const updatedMessages = await listMessages(threadId);

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
    setIsLoading(false); // Set loading state to false
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

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
                }`}
              >
                {message.text}
              </span>
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
