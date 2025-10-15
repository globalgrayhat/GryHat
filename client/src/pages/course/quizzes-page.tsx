import React, { useEffect, useMemo, useState } from "react";
import { getQuizzesByLesson } from "../../api/endpoints/course/quiz";
import { toast } from "react-toastify";
import {
  Question,
  Option,
} from "../../api/types/apiResponses/api-response-quizzes";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/reducers/authSlice";
import { Card, CardBody, Button, Chip, Typography } from "@material-tailwind/react";

// Import student login modal
import StudentLoginModal from "../students/StudentLoginModal";

const Quizzes: React.FC<{ lessonId: string | undefined }> = ({ lessonId }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // State for student login modal
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const [quizzes, setQuizzes] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);
  const [nextClicked, setNextClicked] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | undefined>(undefined);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const fetchQuizzes = async (id: string) => {
      try {
        const response = await getQuizzesByLesson(id);
        setQuizzes(response?.data?.questions ?? []);
        setCurrentQuestionIndex(0);
        setSelectedOptionId(undefined);
        setNextClicked(false);
        setAnsweredCorrectly(undefined);
        setScore(0);
      } catch (error: any) {
        toast.error(error?.data?.message ?? "Failed to load quizzes", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      }
    };

    if (lessonId) fetchQuizzes(lessonId);
  }, [lessonId]);

  const total = quizzes?.length ?? 0;
  const currentQuestion = useMemo(
    () => (quizzes && total > 0 ? quizzes[Math.min(currentQuestionIndex, total - 1)] : null),
    [quizzes, total, currentQuestionIndex]
  );

  const handleOptionSelect = (optionId: string) => setSelectedOptionId(optionId);

  const handleNextQuestion = () => {
    if (!currentQuestion || !selectedOptionId) return;
    setNextClicked(true);

    const selected = currentQuestion.options.find((o) => o._id === selectedOptionId);
    if (selected) {
      setAnsweredCorrectly(selected.isCorrect);
      if (selected.isCorrect) setScore((s) => s + 1);
    }

    setTimeout(() => {
      setSelectedOptionId(undefined);
      setCurrentQuestionIndex((idx) => idx + 1);
      setNextClicked(false);
      setAnsweredCorrectly(undefined);
    }, 800);
  };

  // If user is not logged in: show login prompt
  if (!isLoggedIn) {
    return (
      <>
        <Card shadow={false} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center">
              <Typography variant="h6" className="!m-0 text-gray-900 dark:text-white">
                Please login to solve quizzes
              </Typography>
              {/* Button to open login modal */}
              <button
                onClick={() => setLoginModalOpen(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Login
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Student Login Modal */}
        <StudentLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          onSwitchToRegister={() => {
            setLoginModalOpen(false);
            // Optional: implement if switching to register modal
          }}
        />
      </>
    );
  }

  // Result after finishing
  if (total > 0 && currentQuestionIndex >= total) {
    return (
      <Card shadow={false} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardBody className="p-4 sm:p-6 text-center">
          <Typography variant="h6" className="!m-0 text-gray-900 dark:text-white">
            Congrats! Your score is {score}/{total}
          </Typography>
        </CardBody>
      </Card>
    );
  }

  // No quizzes
  if (!total) {
    return (
      <Card shadow={false} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardBody className="p-4 sm:p-6 text-center">
          <Typography variant="h6" className="!m-0 text-gray-900 dark:text-white">
            No quizzes available for this lesson.
          </Typography>
        </CardBody>
      </Card>
    );
  }

  // Quiz in progress
  return (
    <Card shadow={false} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardBody className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h6" className="!m-0 text-gray-900 dark:text-white text-base sm:text-lg">
              Questions
            </Typography>
            <Chip size="sm" value={total} className="rounded-full text-xs" />
          </div>
          <div className="min-w-[120px] text-right text-[12px] text-gray-600 dark:text-gray-300">
            {currentQuestionIndex + 1} / {total}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
            style={{ width: `${((currentQuestionIndex + 0) / Math.max(total, 1)) * 100}%` }}
          />
        </div>

        {/* Question */}
        <p className="text-sm sm:text-base text-gray-900 dark:text-white mb-4">
          <span className="font-bold mr-2">{currentQuestionIndex + 1}.</span>
          {currentQuestion?.question}
        </p>

        {/* Options */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {currentQuestion?.options.map((option: Option) => {
            const isSelected = selectedOptionId === option._id;

            let cls =
              "w-full rounded-lg border text-left px-3 py-2 sm:px-4 sm:py-3 text-sm transition ring-1 ring-black/5 dark:ring-white/10";
            if (isSelected && nextClicked) {
              cls += option.isCorrect
                ? " bg-green-500 text-white border-green-600"
                : " bg-red-500 text-white border-red-600";
            } else if (isSelected) {
              cls += " bg-blue-600 text-white border-blue-700";
            } else {
              cls +=
                " bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/60 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
            }

            return (
              <li key={option._id}>
                <button type="button" onClick={() => handleOptionSelect(option._id)} className={cls}>
                  {option.option}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Next Button */}
        <div className="mt-4">
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedOptionId}
            color="blue"
            size="sm"
            className="normal-case rounded-full"
          >
            Next
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default Quizzes;
