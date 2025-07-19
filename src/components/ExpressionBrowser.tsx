import { useSearch, useNavigate } from "@tanstack/react-router";

export function ExpressionBrowser() {
  const search = useSearch({ from: "/expressions" });
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          German Expressions
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search expressions..."
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">All Categories</option>
            <option value="business">Business</option>
            <option value="casual">Casual</option>
            <option value="formal">Formal</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🇩🇪</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Expression Browser Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse and search German expressions with filtering and pagination.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Browse Expressions
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
