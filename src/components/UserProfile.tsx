export function UserProfile() {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Profile Management Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage your profile information, preferences, and account settings.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Account Settings
          </button>
        </div>
      </div>
    </div>
  );
}
