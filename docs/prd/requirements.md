# Requirements

## Functional Requirements:

**FR1: User Authentication System**
- Users can sign up and log in using Convex authentication
- User sessions are maintained across browser sessions
- User data is securely stored and protected

**FR2: Expression Dataset Management**
- System stores 200 German expressions spanning all levels (B1-C2)
- Each expression has 5 usage examples
- Expressions are categorized by difficulty level
- Dataset supports pre-generated translation exercises

**FR3: Exercise Generation and Delivery**
- System generates 5+ translation exercises per expression
- Exercises span all difficulty levels for variety
- Exercises are pre-generated and stored in database
- System delivers one exercise at a time via "Next Exercise" button

**FR4: AI-Powered Answer Evaluation**
- System evaluates user answers using LLM (cost-effective model)
- Provides real-time scoring (0-1 scale)
- Delivers constructive textual feedback
- Handles edge cases and unclear responses gracefully

**FR5: ELO Rating System**
- Tracks user level starting from lowest level
- Adjusts user level based on exercise performance
- Maintains medium-high stability for expression/exercise ratings
- Implements initial calibration to determine true user level

**FR6: Exercise Selection Algorithm**
- Dynamically selects exercises based on user level
- Ensures variety across difficulty levels
- Minimizes repetition of recently practiced expressions
- Balances challenge with user capability

**FR7: Progress Tracking**
- Displays current user level prominently
- Tracks expression mastery and practice frequency
- Identifies improvement areas for targeted practice

**FR8: Theme System**
- Provides dark/light mode toggle via corner button
- Persists theme preference across sessions
- Maintains consistent design across themes

**FR9: API-like Function Architecture**
- Implements independent standalone functions for each action
- Functions include: `getNextExercise(userId)`, `submitAnswer(userId, exerciseId, answer)`, `getUserProgress(userId)`, `generateExpressions()`, `evaluateAnswer(exerciseId, userAnswer)`, etc.
- Exposes functions to window object for debugging (development only)
- Enables easy tracking and tracing of all app actions

## Non-Functional Requirements:

**NFR1: Performance**
- AI evaluation responses within 2 seconds
- Exercise loading time under 1 second
- Smooth UI interactions with 60fps animations

**NFR2: UI/UX Design**
- Sharp, crisp edges with minimal rounded borders
- Colorful accents and highlights for visual hierarchy
- Good contrast for readability without eye strain
- Wide, large typography for easy reading
- Ultra-compact layout with minimal padding/margins
- Space efficiency maximizing screen usage
- Information density showing only essential content

**NFR3: Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Responsive design for various screen sizes

**NFR4: Security**
- Secure LLM API integration
- User data protection and privacy
- Input validation and sanitization
- Secure authentication implementation

**NFR5: Maintainability**
- Simple, concise code emphasizing readability
- Small, well-organized files
- Modular architecture for easy testing
- Comprehensive error handling

**NFR6: Scalability**
- Convex architecture supports user growth
- LLM integration strategy manages real-time load
- Database design supports expression dataset expansion

---
