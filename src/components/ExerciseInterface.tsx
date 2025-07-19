import { useParams } from "@tanstack/react-router";

export function ExerciseInterface() {
  const { expressionId } = useParams({ from: "/exercises/$expressionId" });

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Practice Exercise
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Expression ID: {expressionId}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Exercise Interface Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Interactive exercise practice with AI-powered scoring and feedback.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Start Exercise
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
}
