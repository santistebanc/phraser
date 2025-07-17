import { useAuth } from "../contexts/useAuth";

export default function UserDashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = user.name || "User";

  return (
    <div className="w-full h-screen p-2 bg-gray-50 dark:bg-gray-900">
      <div className="w-full h-full bg-white dark:bg-gray-800 border-0 shadow-lg p-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {displayName}!
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white border-0 hover:bg-red-700 text-lg mr-16 cursor-pointer"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500 p-3 border-0">
            <h3 className="text-lg font-semibold text-white">Current Level</h3>
            <p className="text-3xl font-bold text-white">
              {user.currentLevel || 1000}
            </p>
            <p className="text-sm text-blue-100">ELO Rating</p>
          </div>

          <div className="bg-green-500 p-3 border-0">
            <h3 className="text-lg font-semibold text-white">
              Exercises Completed
            </h3>
            <p className="text-3xl font-bold text-white">
              {user.totalExercises || 0}
            </p>
            <p className="text-sm text-green-100">Total Attempts</p>
          </div>

          <div className="bg-purple-500 p-3 border-0">
            <h3 className="text-lg font-semibold text-white">Average Score</h3>
            <p className="text-3xl font-bold text-white">
              {(user.averageScore || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-purple-100">Success Rate</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 border-0">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
            Ready to Learn German?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
            Start practicing with our interactive exercises and improve your
            German language skills.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white border-0 hover:bg-blue-700 font-medium text-lg cursor-pointer">
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
