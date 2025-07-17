# Data Models

## User Model

**Purpose:** Represents authenticated users and their learning progress

**Key Attributes:**
- `_id`: Unique user identifier (Convex-generated)
- `email`: User's email address (unique)
- `name`: User's display name
- `currentLevel`: Current ELO rating (starts at 1000)
- `totalExercises`: Number of exercises completed
- `averageScore`: Average score across all exercises
- `lastActive`: Timestamp of last activity
- `preferences`: User preferences (theme, etc.)
- `createdAt`: Account creation timestamp

**Relationships:**
- One-to-many with ExerciseAttempts
- One-to-many with UserProgress

## Expression Model

**Purpose:** Represents German expressions in the curated dataset (global content)

**Key Attributes:**
- `_id`: Unique expression identifier
- `text`: The German expression text
- `translation`: English translation
- `difficulty`: ELO rating of the expression (B1-C2 levels)
- `category`: Expression category (formal, informal, business, etc.)
- `usageExamples`: Array of 5 usage examples
- `tags`: Array of relevant tags
- `createdAt`: Creation timestamp
- `lastUpdated`: Last modification timestamp

**Relationships:**
- One-to-many with Exercises
- Many-to-many with Users (through UserProgress)

## Exercise Model

**Purpose:** Represents individual translation exercises (global content)

**Key Attributes:**
- `_id`: Unique exercise identifier
- `expressionId`: Reference to parent expression
- `type`: Exercise type (translation, contextual, completion)
- `question`: The exercise question/prompt
- `correctAnswer`: Expected correct answer
- `difficulty`: ELO rating of the exercise
- `hints`: Optional hints for the exercise
- `createdAt`: Creation timestamp
- `globalUsageCount`: Total number of times used across all users
- `globalAverageScore`: Average score across all users

**Relationships:**
- Many-to-one with Expression
- One-to-many with ExerciseAttempts

**Relationships:**
- Many-to-one with Expression
- One-to-many with ExerciseAttempts

## ExerciseAttempt Model

**Purpose:** Tracks individual user attempts at exercises (user-specific data)

**Key Attributes:**
- `_id`: Unique attempt identifier
- `userId`: Reference to user
- `exerciseId`: Reference to exercise
- `userAnswer`: User's submitted answer
- `aiScore`: AI evaluation score (0-1)
- `aiFeedback`: AI-generated feedback text
- `levelChange`: ELO rating change for user
- `timeSpent`: Time taken to answer (seconds)
- `createdAt`: Attempt timestamp

**Relationships:**
- Many-to-one with User
- Many-to-one with Exercise

## UserProgress Model

**Purpose:** Tracks user progress and mastery for specific expressions (user-specific data)

**Key Attributes:**
- `_id`: Unique progress record identifier
- `userId`: Reference to user
- `expressionId`: Reference to expression
- `masteryLevel`: Current mastery level (0-100)
- `attemptsCount`: Number of attempts on this expression
- `lastAttempted`: Last attempt timestamp
- `bestScore`: Best score achieved on this expression
- `averageScore`: Average score across attempts for this expression

**Relationships:**
- Many-to-one with User
- Many-to-one with Expression

---
