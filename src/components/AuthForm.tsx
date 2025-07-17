import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const submitForm = async () => {
      try {
        if (isLogin) {
          await login(email, password);
        } else {
          if (!name.trim()) {
            throw new Error("Name is required");
          }
          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }
          await register(email, name, password);
        }
      } catch (err) {
        let msg = "An error occurred";
        if (err instanceof Error) {
          // Try to extract the user-friendly message from Convex error
          const match = err.message.match(/Error: (.*?)(\n|$)/);
          if (match && match[1]) {
            msg = match[1];
          } else {
            msg = err.message;
          }
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    void submitForm();
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm p-2 bg-white dark:bg-gray-800 border-0 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          {isLogin ? "Login" : "Register"}
        </h2>
        
        {error && (
          <div className="mb-3 p-2 bg-red-500 text-white text-sm border-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-2 py-1 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 cursor-text"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-2 py-1 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 cursor-text"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-lg font-medium text-gray-900 dark:text-white">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 cursor-text"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border-0 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <div className="mt-3 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setEmail("");
              setName("");
              setPassword("");
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 text-lg cursor-pointer"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
} 