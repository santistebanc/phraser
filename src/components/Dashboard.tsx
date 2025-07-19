import { useAuth } from "../contexts/useAuth";
import { Link } from "@tanstack/react-router";

export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.name || "User";

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full bg-white dark:bg-gray-800 border-0 shadow-lg p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}!
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-500 p-6 border-0 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Current Level</h3>
            <p className="text-3xl font-bold text-white">
              {user.currentLevel || 1000}
            </p>
            <p className="text-sm text-blue-100">ELO Rating</p>
          </div>

          <div className="bg-green-500 p-6 border-0 rounded-lg">
            <h3 className="text-lg font-semibold text-white">
              Exercises Completed
            </h3>
            <p className="text-3xl font-bold text-white">
              {user.totalExercises || 0}
            </p>
            <p className="text-sm text-green-100">Total Attempts</p>
          </div>

          <div className="bg-purple-500 p-6 border-0 rounded-lg">
            <h3 className="text-lg font-semibold text-white">Average Score</h3>
            <p className="text-3xl font-bold text-white">
              {(user.averageScore || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-purple-100">Success Rate</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-6 border-0 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Ready to Learn German?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            Start practicing with our interactive exercises and improve your
            German language skills.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/expressions"
              className="px-6 py-3 bg-blue-600 text-white border-0 hover:bg-blue-700 font-medium text-lg cursor-pointer rounded-lg transition-colors"
            >
              Browse Expressions
            </Link>
            <Link
              to="/progress"
              className="px-6 py-3 bg-green-600 text-white border-0 hover:bg-green-700 font-medium text-lg cursor-pointer rounded-lg transition-colors"
            >
              View Progress
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Continue where you left off with your last practice session.
            </p>
            <Link
              to="/progress"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View History →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Profile Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Update your preferences and account information.
            </p>
            <Link
              to="/profile"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Manage Profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
