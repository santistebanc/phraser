import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function DebugPanel() {
  const dbState = useQuery(api.debug.debugDatabaseState);
  const exerciseState = useQuery(api.debug.debugExercises);
  const difficultyRanges = useQuery(api.debug.checkDifficultyRanges);
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const activateAllExercises = useMutation(api.debug.activateAllExercises);
  const scaleDifficulties = useMutation(api.debug.scaleDifficulties);

  const handleSeedDatabase = async () => {
    try {
      const result = await seedDatabase({});
      alert(result);
      window.location.reload();
    } catch (error) {
      alert("Error seeding database: " + error);
    }
  };

  const handleActivateAllExercises = async () => {
    try {
      const result = await activateAllExercises({});
      alert(result);
      window.location.reload();
    } catch (error) {
      alert("Error activating exercises: " + error);
    }
  };

  const handleScaleDifficulties = async () => {
    try {
      const result = await scaleDifficulties({});
      alert(result);
      window.location.reload();
    } catch (error) {
      alert("Error scaling difficulties: " + error);
    }
  };

  if (!dbState || !exerciseState) {
    return <div>Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Database Debug Info</h2>
        <div className="flex gap-2">
          <button
            onClick={handleScaleDifficulties}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Scale Difficulties
          </button>
          <button
            onClick={handleActivateAllExercises}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Activate All Exercises
          </button>
          <button
            onClick={handleSeedDatabase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seed Database
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="font-medium">Total Expressions:</div>
          <div className="text-2xl font-bold text-blue-600">
            {dbState.totalExpressions}
          </div>
        </div>
        <div>
          <div className="font-medium">Total Exercises:</div>
          <div className="text-2xl font-bold text-green-600">
            {exerciseState.totalExercises}
          </div>
        </div>
        <div>
          <div className="font-medium">Active Exercises:</div>
          <div className="text-2xl font-bold text-green-600">
            {exerciseState.activeExercises}
          </div>
        </div>
        <div>
          <div className="font-medium">Inactive Exercises:</div>
          <div className="text-2xl font-bold text-red-600">
            {exerciseState.inactiveExercises}
          </div>
        </div>
        <div>
          <div className="font-medium">Expressions with Exercises:</div>
          <div className="text-2xl font-bold text-green-600">
            {dbState.expressionsWithExercises}
          </div>
        </div>
        <div>
          <div className="font-medium">Expressions without Exercises:</div>
          <div className="text-2xl font-bold text-red-600">
            {dbState.expressionsWithoutExercises}
          </div>
        </div>
      </div>

      {difficultyRanges && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Difficulty Ranges:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="font-medium">Expressions:</div>
              <div className="text-sm">
                Count: {difficultyRanges.expressions.count}
                <br />
                Range: {difficultyRanges.expressions.minDifficulty} -{" "}
                {difficultyRanges.expressions.maxDifficulty}
                <br />
                Avg: {difficultyRanges.expressions.avgDifficulty.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="font-medium">Exercises:</div>
              <div className="text-sm">
                Count: {difficultyRanges.exercises.count}
                <br />
                Range: {difficultyRanges.exercises.minDifficulty} -{" "}
                {difficultyRanges.exercises.maxDifficulty}
                <br />
                Avg: {difficultyRanges.exercises.avgDifficulty.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="font-medium">Users:</div>
              <div className="text-sm">
                Count: {difficultyRanges.users.count}
                <br />
                Range: {difficultyRanges.users.minLevel} -{" "}
                {difficultyRanges.users.maxLevel}
                <br />
                Avg: {difficultyRanges.users.avgLevel.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-medium mb-2">Expression Details:</h3>
        <div className="max-h-60 overflow-y-auto">
          {dbState.expressionDetails.map((expression) => (
            <div
              key={expression._id}
              className={`p-2 mb-1 rounded ${
                expression.hasExercises
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{expression.text}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    ({expression.translation})
                  </span>
                </div>
                <div className="text-sm">
                  {expression.hasExercises ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✅ {expression.exerciseCount} exercises
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ❌ No exercises
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Details */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Exercise Details:</h3>
        <div className="max-h-60 overflow-y-auto">
          {exerciseState.exerciseDetails.map((exercise) => (
            <div
              key={exercise._id}
              className={`p-2 mb-1 rounded ${
                exercise.isActive
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{exercise.question}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    ({exercise.type})
                  </span>
                </div>
                <div className="text-sm">
                  {exercise.isActive ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✅ Active
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      ❌ Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
