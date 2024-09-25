"use client";

import { useState, useEffect } from "react";
import formValues from "@/constants/formValues.json";
import {
  createConversation,
  continueConversation,
  pollConversation,
} from "./../lib/api";
import { ChevronRight, ChevronLeft, CircleCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const assistantId =
  process.env.NEXT_PUBLIC_APP_ASSISTANT_ID || "default_assistant_id";

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(5);
  const [summary, setSummary] = useState<Array<{ content: string }>>([]);
  const [open, setOpen] = useState(false);
  const steps = formValues.map((section) => section.title);
  const [isLoading, setIsLoading] = useState(false);

  interface Content {
    content_link?: string;
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
  }, [activeStep, answers, checkStepCompletion]);

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

      const message = { role: "user", content: formattedAnswers };
      await continueConversation(thread.id, role, message);

      const response = await pollConversation(assistantId, thread.id);
      const mappedMessages = response.data
        .filter((item: { role: string }) => item.role === "assistant")
        .map((item: { content: { text: { value: any } }[] }) => {
          const rawContent = item.content[0].text.value;
          const jsonString = rawContent.match(/```json\n([\s\S]*?)\n```/)?.[1];
          if (jsonString) {
            try {
              const parsedContent = JSON.parse(jsonString);
              return { content: parsedContent };
            } catch (error) {
              console.error("Error parsing JSON content:", error);
            }
          }
          return { content: {} };
        });

      setOpen(true);
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

  return (
    <div className="p-6 md:p-12 border-2 border-gray-300 rounded-2xl shadow-md">
      <h1 className="text-xl md:text-3xl font-bold mb-4">
        Child Development Form
      </h1>
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
                        ? "bg-blue-600 text-white"
                        : isCompleted
                          ? "bg-blue-300 text-white"
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
        <button
          disabled={activeStep === 0}
          onClick={handleBack}
          className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={!isStepComplete || isLoading}
          className="py-2 px-6 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isLoading ? (
            <Spinner />
          ) : activeStep === steps.length - 1 ? (
            "Submit"
          ) : (
            "Next"
          )}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative p-8 bg-white rounded-lg max-w-lg mx-auto">
            <h2 className="text-xl md:text-2xl mb-4">Results:</h2>
            {summary && summary.length > 0 ? (
              summary.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-100 p-4 mb-4 rounded-lg text-center"
                >
                  <p className="mb-2 text-lg md:text-xl">
                    Hey, we found the best learning material for you!
                  </p>
                  <button
                    onClick={() => {
                      const content =
                        typeof item.content === "object" &&
                        item.content !== null
                          ? (item.content as Content)
                          : {};
                      const url = content.content_link;
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer");
                      } else {
                        console.error(
                          "No valid link found in content:",
                          item.content
                        );
                      }
                    }}
                    className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm md:text-base"
                  >
                    Click here to download!
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-red-100 p-4 mb-4 rounded-lg text-center">
                <p className="text-lg md:text-xl text-gray-700">
                  No learning materials found.
                </p>
              </div>
            )}
            <div className="w-full justify-center flex">
              <button
                onClick={() => setOpen(false)}
                className="mt-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
