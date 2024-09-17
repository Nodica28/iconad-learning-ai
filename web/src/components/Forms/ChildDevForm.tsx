import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Modal,
} from "@mui/material";
import {
  createConversation,
  continueConversation,
  pollConversation,
} from "../../api/conversationService";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import formValues from "../../constants/formValues.json";
import LoadingSpinner from "../Loader/LoadingSpinner";

const assistantId = import.meta.env.VITE_REACT_APP_ASSISTANT_ID;

const ChildDevelopmentForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(5);
  const [summary, setSummary] = useState<Array<{ content: string }>>([]);
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const steps = formValues.map((section) => section.title);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkStepCompletion();
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

  const checkStepCompletion = () => {
    const currentSection = formValues[activeStep];
    if (!currentSection) return;

    const allQuestionsAnswered = currentSection.questions.every(
      (question, index) => answers[`question_${activeStep}_${index}`]
    );
    setIsStepComplete(allQuestionsAnswered);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const formattedAnswers = JSON.stringify(
      formValues.reduce(
        (acc, section, sectionIndex) => {
          acc[section.title] = section.questions.reduce(
            (questionAcc, question, questionIndex) => {
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
      setThreadId(thread.id);

      if (!thread.id) {
        throw new Error("Failed to retrieve thread ID");
      }

      const message = { role: "user", content: formattedAnswers };
      await continueConversation(thread.id, message);
      const response = await pollConversation(assistantId, thread.id);

      const mappedMessages = response.data
        .filter((item) => item.role === "assistant")
        .map((item) => {
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
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          {currentSection.title}
        </Typography>
        {currentSection.questions.map((question, index) => (
          <Box
            key={index}
            sx={{
              mb: 3,
            }}
          >
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">{question.question}</FormLabel>
              <RadioGroup
                name={`question_${step}_${index}`}
                value={answers[`question_${step}_${index}`] || ""}
                onChange={(e) =>
                  handleAnswerChange(
                    `question_${step}_${index}`,
                    e.target.value
                  )
                }
              >
                {question.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
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
      (_, questionIndex) => answers[`question_${stepIndex}_${questionIndex}`]
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{ p: 4, border: "2px solid #e0e0e0", borderRadius: 2 }}
    >
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Child Development Form
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <IconButton onClick={handleChevronLeft} disabled={visibleStart === 0}>
          <ChevronLeftIcon />
        </IconButton>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ flexGrow: 1, overflow: "hidden" }}
        >
          {steps.slice(visibleStart, visibleEnd).map((label, index) => {
            const actualIndex = visibleStart + index;
            const isCompleted = isStepAnswered(actualIndex);
            return (
              <Step key={label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor:
                          activeStep === actualIndex
                            ? "primary.main"
                            : isCompleted
                              ? "primary.light"
                              : "grey.300",
                        color: "white",
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      ) : (
                        actualIndex + 1
                      )}
                    </Box>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
        <IconButton
          onClick={handleChevronRight}
          disabled={visibleEnd >= steps.length}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ px: 4 }}>
        {renderStepContent(activeStep)}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
            disabled={!isStepComplete || isLoading}
            sx={{
              paddingY: 1,
              paddingX: 4,
            }}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : activeStep === steps.length - 1 ? (
              "Submit"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ overflow: "scroll" }}
      >
        <Box
          sx={{
            p: 4,
            backgroundColor: "white",
            borderRadius: 2,
            maxWidth: 800,
            margin: "auto",
            mt: 4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Results:
          </Typography>
          {summary &&
            summary.map((item, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: "10px",
                  padding: "20px",
                  marginBottom: "20px",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ marginBottom: 1 }}>
                  Hey, we found the best learning material for you!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const url = item.content.content_link;
                    if (url) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    } else {
                      console.error(
                        "No valid link found in content:",
                        item.content
                      );
                    }
                  }}
                  sx={{ mt: 2, fontSize: 16 }}
                >
                  Click here to download!
                </Button>
              </Box>
            ))}
          <Button onClick={() => setOpen(false)} sx={{ mt: 2, fontSize: 16 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

export default ChildDevelopmentForm;
