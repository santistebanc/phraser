import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";

type ExerciseType =
  | "translation"
  | "fill-in-blank"
  | "multiple-choice"
  | "rearrange";

interface Exercise {
  _id: string;
  expressionId: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  difficulty: number;
  hints?: string[];
  createdAt: number;
  globalUsageCount: number;
  globalAverageScore: number;
  isActive: boolean;
}

export function RandomExerciseInterface() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // State to store current exercise
  const [currentExercise, setCurrentExercise] = useState<any>(null);
  const [isLoadingExercise, setIsLoadingExercise] = useState(false);

  // Fetch initial random exercise
  const initialExercise = useQuery(api.exercises.getRandomExercise, {
    userId: user?._id,
  });

  // Use initial exercise if no current exercise is set
  const exercise = currentExercise || initialExercise;

  // Start timing when exercise loads
  useEffect(() => {
    if (exercise && !startTime) {
      setStartTime(Date.now());
    }
  }, [exercise, startTime]);

  // Fetch expression details for the random exercise (only when we have an exercise)
  const expression = useQuery(
    api.expressions.getExpressionById,
    {
      expressionId: exercise?.expressionId || "",
    },
    {
      enabled: !!exercise?.expressionId && exercise.expressionId !== "", // Only call when we have a valid expressionId
    },
  );

  // Mutations
  const submitExerciseAttemptEnhanced = useMutation(
    api.exercises.submitExerciseAttemptEnhanced,
  );
  const updateUserProgress = useMutation(api.progress.updateUserProgress);
  const getNewRandomExercise = useMutation(api.exercises.getNewRandomExercise);

  const handleAnswerSubmit = async () => {
    if (!exercise || !user || !expression) return;

    setIsLoading(true);

    // Calculate time spent
    const endTime = Date.now();
    const timeSpentSeconds = startTime
      ? Math.round((endTime - startTime) / 1000)
      : 0;
    setTimeSpent(timeSpentSeconds);

    const answer = userAnswer || selectedOption || "";

    // Basic correctness check for UI feedback
    const correct =
      answer.toLowerCase().trim() ===
      exercise.correctAnswer.toLowerCase().trim();

    setIsAnswered(true);
    setIsCorrect(correct);
    setShowFeedback(true);

    try {
      // Submit attempt using enhanced scoring
      await submitExerciseAttemptEnhanced({
        exerciseId: exercise._id,
        userId: user._id,
        userAnswer: answer,
        timeSpent: timeSpentSeconds,
        question: exercise.question,
        exerciseType: exercise.type,
      });

      // Update user progress (keeping legacy for compatibility)
      await updateUserProgress({
        userId: user._id,
        expressionId: exercise.expressionId,
        score: correct ? Math.max(10, exercise.difficulty) : 0,
        isCorrect: correct,
      });
    } catch (error) {
      console.error("Error submitting exercise attempt:", error);
    }

    setIsLoading(false);
  };

  const handleNextExercise = async () => {
    // Reset state for new exercise
    setUserAnswer("");
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowFeedback(false);
    setStartTime(null);
    setTimeSpent(0);
    setIsLoadingExercise(true);

    try {
      // Get a new random exercise using mutation (bypasses cache)
      const newExercise = await getNewRandomExercise({
        userId: user?._id,
      });

      if (newExercise) {
        setCurrentExercise(newExercise);
      } else {
        console.error("No new exercise available");
      }
    } catch (error) {
      console.error("Error getting new exercise:", error);
    } finally {
      setIsLoadingExercise(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate({ to: "/" });
  };

  const renderExerciseContent = () => {
    if (!exercise) return null;

    switch (exercise.type) {
      case "translation":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              Translate this expression:
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {exercise.question}
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your translation..."
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isAnswered}
            />
          </div>
        );

      case "fill-in-blank":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              Fill in the blank:
            </div>
            <div className="text-xl text-gray-900 dark:text-white">
              {exercise.question.replace("___", "_____")}
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter the missing word..."
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isAnswered}
            />
          </div>
        );

      case "multiple-choice":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {exercise.question}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Enter your answer:
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isAnswered}
            />
          </div>
        );

      case "rearrange":
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              Rearrange the words to form the correct expression:
            </div>
            <div className="text-xl text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {exercise.question}
            </div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Enter the correct order..."
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              disabled={isAnswered}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderFeedback = () => {
    if (!showFeedback || !exercise) return null;

    return (
      <div
        className={`p-4 rounded-lg ${
          isCorrect
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        }`}
      >
        <div
          className={`font-medium ${
            isCorrect
              ? "text-green-800 dark:text-green-200"
              : "text-red-800 dark:text-red-200"
          }`}
        >
          {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Correct answer: {exercise.correctAnswer}
        </div>
      </div>
    );
  };

  if (!exercise) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            No exercises available
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            There are no active exercises in the database. Please activate
            exercises or seed the database first.
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate({ to: "/" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!expression) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Loading expression details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Random Exercise: {expression.text}
        </h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Difficulty: {exercise.difficulty} • Your Level: {user?.currentLevel}
        </div>
      </div>

      {/* Exercise Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        {renderExerciseContent()}
      </div>

      {/* Feedback */}
      {renderFeedback()}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {!isAnswered ? (
          <button
            onClick={handleAnswerSubmit}
            disabled={isLoading || (!userAnswer && !selectedOption)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Answer"}
          </button>
        ) : (
          <div className="flex space-x-4">
            <button
              onClick={handleNextExercise}
              disabled={isLoadingExercise}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingExercise ? "Loading..." : "Next Exercise"}
            </button>
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
