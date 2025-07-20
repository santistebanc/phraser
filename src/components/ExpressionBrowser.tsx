import { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ExpressionBrowser() {
  const search = useSearch({ from: "/expressions" });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(search.q || "");
  const [selectedCategory, setSelectedCategory] = useState(
    search.category || "",
  );

  // Fetch expressions
  const expressions = useQuery(api.expressions.getExpressions, {
    category: selectedCategory || undefined,
    limit: 50,
  });

  // Fetch categories
  const categories = useQuery(api.expressions.getCategories);

  const handleStartExercise = (expressionId: string) => {
    navigate({ to: "/exercises/$expressionId", params: { expressionId } });
  };

  const filteredExpressions =
    expressions?.filter(
      (expression) =>
        expression.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expression.translation.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          German Expressions
        </h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search expressions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {!expressions && (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600 dark:text-gray-400">
            Loading expressions...
          </div>
        </div>
      )}

      {/* No Expressions */}
      {expressions && expressions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🇩🇪</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            No Expressions Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}

      {/* Expressions Grid */}
      {filteredExpressions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpressions.map((expression) => (
            <div
              key={expression._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {expression.text}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {expression.translation}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {expression.category}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Difficulty: {expression.difficulty}
                </span>
              </div>

              {expression.usageExamples.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Example usage:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white italic">
                    "{expression.usageExamples[0]}"
                  </p>
                </div>
              )}

              <button
                onClick={() => handleStartExercise(expression._id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Exercise
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredExpressions.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredExpressions.length} of {expressions?.length || 0}{" "}
          expressions
        </div>
      )}
    </div>
  );
}
