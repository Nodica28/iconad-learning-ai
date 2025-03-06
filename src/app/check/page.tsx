"use client";

import { useState, useEffect } from "react";
import formValues from "@/constants/formValues.json";
import {
  createConversation,
  continueConversation,
  pollConversation,
  saveTraits,
} from "@/lib/api";
import { ChevronRight, ChevronLeft, CircleCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { saveMatches } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/api";

const assistantId =
  process.env.NEXT_PUBLIC_APP_ASSISTANT_ID || "default_assistant_id";

export default function Home() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(5);
  const [summary, setSummary] = useState<Message[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const steps = formValues.map((section) => section.title);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRecord, setHasRecord] = useState(false);

  useEffect(() => {
    const checkRecord = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.last_progress) {
          setHasRecord(true);
        } else {
          setHasRecord(false);
        }
      }
    };
    checkRecord();
  }, []);

  interface Message {
    content_links: string[];
  }

  interface Answer {
    [key: string]: string;
  }

  const checkStepCompletion = () => {
    const currentSection = formValues[activeStep];
    if (!currentSection) return;

    const allQuestionsAnswered = currentSection.questions.every(
      (_question, questionIndex) =>
        answers[`question_${activeStep}_${questionIndex}`]
    );

    setIsStepComplete(allQuestionsAnswered);
  };

  useEffect(() => {
    checkStepCompletion();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, answers]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => {
      const newActiveStep = prevActiveStep + 1;
      if (newActiveStep >= visibleEnd) {
        setVisibleStart(visibleStart + 1);
        setVisibleEnd(visibleEnd + 1);
      }
      return newActiveStep;
    });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => {
      const newActiveStep = prevActiveStep - 1;
      if (newActiveStep < visibleStart) {
        setVisibleStart(visibleStart - 1);
        setVisibleEnd(visibleEnd - 1);
      }
      return newActiveStep;
    });
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    const role = "user";
    setIsLoading(true);

    const formattedAnswers = JSON.stringify(
      formValues.reduce(
        (acc, section, sectionIndex) => {
          acc[section.title] = section.questions.reduce(
            (questionAcc: Answer, question, questionIndex) => {
              const answerKey = `question_${sectionIndex}_${questionIndex}`;
              questionAcc[question.question] = answers[answerKey] || "";
              return questionAcc;
            },
            {}
          );
          return acc;
        },
        {} as Record<string, Record<string, string>>
      )
    );

    try {
      const thread = await createConversation();

      if (!thread.id) {
        throw new Error("Failed to retrieve thread ID");
      }

      await continueConversation(thread.id, role, formattedAnswers);

      const response = await pollConversation(assistantId, thread.id);
      
      // Check if response is an array (as shown in your example)
      const assistantResponses = Array.isArray(response) 
        ? response.filter((item: any) => item.role === "assistant")
        : response.data && Array.isArray(response.data)
          ? response.data.filter((item: any) => item.role === "assistant")
          : [];

      const traitsToJSON = JSON.parse(formattedAnswers);

      await saveTraits(traitsToJSON);

      const mappedMessages = await Promise.all(
        assistantResponses.map(
          async (item: any) => {
            // Check if content exists and is an array
            if (!item.content || !Array.isArray(item.content) || item.content.length === 0) {
              return { content_links: [] };
            }
            
            // Find the first text content
            const textContent = item.content.find((c: any) => c.type === "text");
            if (!textContent || !textContent.text || !textContent.text.value) {
              return { content_links: [] };
            }
            
            const rawContent = textContent.text.value;
            const jsonString = rawContent.match(
              /```json\n([\s\S]*?)\n```/
            )?.[1];
            
            if (jsonString) {
              try {
                const parsedContent = JSON.parse(jsonString);
                if (parsedContent.matches && Array.isArray(parsedContent.matches)) {
                  const contentLinks = parsedContent.matches.map(
                    (match: any) => match.content_link
                  );
                  await saveMatches(parsedContent.matches);
                  return { content_links: contentLinks };
                }
              } catch (error) {
                console.error("Error parsing JSON content:", error);
              }
            }
            return { content_links: [] };
          }
        )
      );

      const userData = await getUserData();

      localStorage.setItem("user", JSON.stringify(userData));

      setSubmitted(true);
      setSummary(mappedMessages);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    const currentSection = formValues[step];
    if (!currentSection) return null;
    return (
      <>
        <h2 className="mb-2 text-[1.2rem] sm:text-[1.3rem] md:text-[1.6rem]">
          {currentSection.title}
        </h2>
        {currentSection.questions.map((question, index) => (
          <div key={index} className="mb-3">
            <h3 className="text-[1rem] sm:text-[1.1rem] md:text-[1.3rem] mt-3">
              {question.question}
            </h3>
            <RadioGroup
              name={`question_${step}_${index}`}
              value={answers[`question_${step}_${index}`] || ""}
              onValueChange={(value: string) =>
                handleAnswerChange(`question_${step}_${index}`, value)
              }
              className="mt-2"
            >
              {question.options.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`option-${option.value}`}
                  />
                  <Label
                    htmlFor={`option-${option.value}`}
                    className="text-[.9rem] sm:text-[1rem] md:text-[1.1rem]"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </>
    );
  };

  const handleChevronLeft = () => {
    if (visibleStart > 0) {
      setVisibleStart(visibleStart - 1);
      setVisibleEnd(visibleEnd - 1);
    }
  };

  const handleChevronRight = () => {
    if (visibleEnd < steps.length) {
      setVisibleStart(visibleStart + 1);
      setVisibleEnd(visibleEnd + 1);
    }
  };

  const isStepAnswered = (stepIndex: number) => {
    const section = formValues[stepIndex];

    return section.questions.every(
      (_question, questionIndex) =>
        answers[`question_${stepIndex}_${questionIndex}`]
    );
  };

  const handleProceedToAI = () => {
    router.push("/conversation");
  };

  const handleDownloadAll = async (downloadLinks: string[]) => {
    if (!downloadLinks || downloadLinks.length === 0) {
      return; // Exit if the array is undefined or empty
    }

    alert("Please ensure pop-ups are allowed to download all files.");

    for (const link of downloadLinks) {
      const isImage = [
        "png",
        "svg",
        "jpg",
        "jpeg",
        "gif",
        "bmp",
        "webp",
        "tiff",
        "ico",
        "heic",
        "avif",
      ].some((ext) => link.toLowerCase().endsWith(ext));

      if (isImage) {
        try {
          const response = await fetch(link);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = link.split("/").pop() || "download";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error downloading image:", error);
        }
      } else {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div className="p-6 md:p-12 border-2 border-gray-300 rounded-2xl shadow-md">
      <div className="flex justify-between">
        <h1 className="text-xl md:text-3xl font-bold mb-4">
          Child Development Form
        </h1>
        {hasRecord && (
          <Button
            variant={"outline"}
            className="px-4 h-10 border-gray-600 border-2 rounded-lg text-xs md:text-sm"
            onClick={handleProceedToAI}
          >
            Proceed to AI Assistant
          </Button>
        )}
      </div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleChevronLeft}
          disabled={visibleStart === 0}
          className="mr-2"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>
        <div className="flex-grow overflow-hidden">
          <div className="flex justify-between gap-2 md:gap-4">
            {steps.slice(visibleStart, visibleEnd).map((label, index) => {
              const actualIndex = visibleStart + index;
              const isCompleted = isStepAnswered(actualIndex);
              return (
                <div
                  key={label}
                  className="text-center flex-grow phone:w-[30%] sm:max-w-[20%]"
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      activeStep === actualIndex
                        ? "bg-primary text-white"
                        : isCompleted
                          ? "bg-primary-light text-white"
                          : "bg-gray-300 text-gray-700"
                    } flex items-center justify-center mx-auto mb-1`}
                  >
                    {isCompleted ? (
                      <CircleCheck className="h-5 w-5" />
                    ) : (
                      actualIndex + 1
                    )}
                  </div>
                  <div className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-base w-full">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={handleChevronRight}
          disabled={visibleEnd >= steps.length}
          className="ml-2"
        >
          <ChevronRight className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      <div className="px-4">{renderStepContent(activeStep)}</div>
      <div className="mt-6 flex justify-between">
        <Button
          variant={"secondary"}
          disabled={activeStep === 0}
          onClick={handleBack}
          className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          variant={"secondary"}
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={!isStepComplete || isLoading}
          className="py-2 px-6 bg-primary text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? (
            <Spinner />
          ) : activeStep === steps.length - 1 ? (
            "Submit"
          ) : (
            "Next"
          )}
        </Button>
      </div>
      {submitted && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative p-8 bg-white rounded-lg max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl mb-4">Results:</h2>
            {summary && summary.length > 0 ? (
              summary.map((item, index) => {
                const contentLinks = item.content_links;
                return (
                  <div
                    key={index}
                    className="bg-gray-100 p-4 mb-4 rounded-lg text-center"
                  >
                    <p className="mb-2 text-lg md:text-xl">
                      Hey, we found the best learning materials for you!
                    </p>
                    <Button
                      variant={"secondary"}
                      onClick={() => {
                        if (Array.isArray(contentLinks)) {
                          handleDownloadAll(contentLinks);
                        }
                      }}
                      className="mt-2 py-2 px-4 bg-primary text-white rounded-lg text-sm md:text-base"
                    >
                      Download All
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="bg-red-100 p-4 mb-4 rounded-lg text-center">
                <p className="text-lg md:text-xl text-gray-700">
                  No learning materials found.
                </p>
              </div>
            )}

            <div className="w-full justify-center flex mt-4">
              <Button
                variant={"outline"}
                className="mt-2 py-2 px-4 border-gray-600 border-2 rounded-lg text-sm md:text-base"
                onClick={handleProceedToAI}
              >
                Proceed to AI Assistant
              </Button>
              <Button
                variant={"secondary"}
                onClick={() => setSubmitted(false)}
                className="ml-4 mt-2 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
