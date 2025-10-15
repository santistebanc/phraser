import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DebugPanel } from "./DebugPanel";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user's recent progress
  const userProgress = useQuery(api.progress.getAllUserProgress, {
    userId: user?._id || "",
  });

  const handleStartRandomExercise = () => {
    navigate({ to: "/exercises/random" });
  };

  const handleBrowseExpressions = () => {
    navigate({ to: "/expressions" });
  };

  const handleViewProgress = () => {
    navigate({ to: "/progress" });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Please log in to view your dashboard.
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalExpressions = userProgress?.length || 0;
  const masteredExpressions =
    userProgress?.filter((p) => p.masteryLevel >= 80).length || 0;
  const averageScore =
    userProgress?.reduce((sum, p) => sum + p.averageScore, 0) /
      totalExpressions || 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.name || user.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to continue your German learning journey?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start Random Exercise
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Practice with exercises tailored to your current level.
          </p>
          <button
            onClick={handleStartRandomExercise}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Exercise
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Browse Expressions
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Explore German expressions by category and difficulty.
          </p>
          <button
            onClick={handleBrowseExpressions}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Browse
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            View Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your learning progress and achievements.
          </p>
          <button
            onClick={handleViewProgress}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            View Progress
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {user.currentLevel}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Level
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            {user.totalExercises}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Exercises Completed
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {Math.round(user.averageScore)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Score
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {masteredExpressions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mastered Expressions
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        {userProgress && userProgress.length > 0 ? (
          <div className="space-y-3">
            {userProgress.slice(0, 5).map((progress) => (
              <div
                key={progress._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Expression #{progress.expressionId.slice(-6)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mastery: {progress.masteryLevel}% • Attempts:{" "}
                    {progress.attemptsCount}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {Math.round(progress.averageScore)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Best: {progress.bestScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-600 dark:text-gray-400">
              No recent activity. Start your first exercise!
            </p>
          </div>
        )}
      </div>

      {/* Debug Panel - Temporary */}
      <div className="mt-8">
        <DebugPanel />
      </div>
    </div>
  );
}
