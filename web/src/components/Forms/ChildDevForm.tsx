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
  listMessages,
  pollConversation,
} from "../../api/conversationService";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import formValues from "../../constants/formValues.json";
import ReactMarkdown from "react-markdown";

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
      const message = { role: "user", content: formattedAnswers };
      await continueConversation(threadId, message);
      await pollConversation(assistantId, threadId);

      handleListMessages();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleListMessages = async () => {
    if (!threadId) {
      console.error("No conversation ID available");
      return;
    }

    try {
      const response = await listMessages(threadId);

      const mappedMessages = response
        .filter((item) => item.role === "assistant")
        .map((item) => ({
          content: item.content[0].text.value,
        }));

      setOpen(true);
      setSummary(mappedMessages);
    } catch (error) {
      console.error("Error listing messages:", error);
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
            disabled={!isStepComplete}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
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
            maxWidth: 600,
            margin: "auto",
            mt: 4,
          }}
        >
          <Typography variant="h6">Summary</Typography>
          {summary &&
            summary.map((item, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "10px",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <ReactMarkdown
                  components={{
                    code: ({ children }) => (
                      <code style={{ whiteSpace: "pre-wrap" }}>{children}</code>
                    ),
                  }}
                >
                  {item.content}
                </ReactMarkdown>
              </Box>
            ))}
          <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Paper>
  );
};

export default ChildDevelopmentForm;
