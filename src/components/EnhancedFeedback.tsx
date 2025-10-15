import React from "react";

interface PerformanceMetrics {
  accuracyScore: number;
  difficultyBonus: number;
  timeBonus: number;
  patternBonus: number;
}

interface EnhancedFeedbackProps {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  score: number;
  feedback: string;
  levelChange: number;
  performanceMetrics?: PerformanceMetrics;
  timeSpent: number;
  exerciseDifficulty: number;
  userLevel: number;
}

export function EnhancedFeedback({
  isCorrect,
  userAnswer,
  correctAnswer,
  score,
  feedback,
  levelChange,
  performanceMetrics,
  timeSpent,
  exerciseDifficulty,
  userLevel,
}: EnhancedFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600 dark:text-green-400";
    if (score >= 0.7) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 0.5) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getLevelChangeText = (change: number) => {
    if (change > 0) return `+${change} level`;
    if (change < 0) return `${change} level`;
    return "No change";
  };

  const getLevelChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-4">
      {/* Main Feedback */}
      <div
        className={`p-4 rounded-lg ${
          isCorrect
            ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div
            className={`font-medium text-lg ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {isCorrect ? "✅ Correct!" : "❌ Incorrect"}
          </div>
          <div className={`text-sm font-medium ${getScoreColor(score)}`}>
            Score: {Math.round(score * 100)}%
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {feedback}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>
            Your answer: <span className="font-medium">{userAnswer}</span>
          </div>
          <div>
            Correct answer: <span className="font-medium">{correctAnswer}</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Performance Analysis
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {Math.round(performanceMetrics.accuracyScore * 100)}%
              </div>
            </div>

            <div>
              <div className="text-gray-600 dark:text-gray-400">
                Difficulty Bonus
              </div>
              <div
                className={`font-medium ${
                  performanceMetrics.difficultyBonus > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {performanceMetrics.difficultyBonus > 0 ? "+" : ""}
                {Math.round(performanceMetrics.difficultyBonus * 100)}%
              </div>
            </div>

            <div>
              <div className="text-gray-600 dark:text-gray-400">Time Bonus</div>
              <div
                className={`font-medium ${
                  performanceMetrics.timeBonus > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {performanceMetrics.timeBonus > 0 ? "+" : ""}
                {Math.round(performanceMetrics.timeBonus * 100)}%
              </div>
            </div>

            <div>
              <div className="text-gray-600 dark:text-gray-400">
                Pattern Bonus
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {Math.round(performanceMetrics.patternBonus * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level and Difficulty Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Level Change</div>
            <div className={`font-medium ${getLevelChangeColor(levelChange)}`}>
              {getLevelChangeText(levelChange)}
            </div>
          </div>

          <div>
            <div className="text-gray-600 dark:text-gray-400">Time Spent</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {timeSpent}s
            </div>
          </div>

          <div>
            <div className="text-gray-600 dark:text-gray-400">
              Exercise Difficulty
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {exerciseDifficulty}
            </div>
          </div>

          <div>
            <div className="text-gray-600 dark:text-gray-400">Your Level</div>
            <div className="font-medium text-gray-900 dark:text-white">
              {userLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          💡 Learning Tip
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {score >= 0.9
            ? "Excellent work! You're mastering this level. Try more challenging exercises."
            : score >= 0.7
              ? "Good progress! Focus on the areas where you made small errors."
              : score >= 0.5
                ? "Keep practicing! Review the correct answer and try similar exercises."
                : "Don't worry! Learning takes time. Practice this expression more to improve."}
        </div>
      </div>
    </div>
  );
}
