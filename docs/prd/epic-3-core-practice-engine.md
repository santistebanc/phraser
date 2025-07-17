# Epic 3: Core Practice Engine

**Epic Goal:** Build the exercise delivery system, AI-powered evaluation, and ELO rating algorithm with initial calibration. This epic creates the core learning mechanics that adapt to user performance.

## Story 3.1: Exercise Selection Algorithm
As a user,
I want to receive exercises that match my current level and provide variety,
so that I can practice effectively without getting bored or overwhelmed.

**Acceptance Criteria:**
1. Algorithm selects exercises based on user's current level
2. Exercises span all difficulty levels for variety
3. Minimizes repetition of recently practiced expressions
4. Balances challenge with user capability
5. Handles edge cases (new users, all exercises completed)
6. Performance optimized for quick exercise loading
7. Exercise selection logged for debugging

## Story 3.2: AI-Powered Answer Evaluation
As a user,
I want immediate, accurate feedback on my German translations,
so that I can learn from my mistakes and improve.

**Acceptance Criteria:**
1. LLM integration for answer evaluation (cost-effective model)
2. Real-time scoring (0-1 scale) with detailed feedback
3. Handles various answer formats and edge cases
4. Response time under 2 seconds
5. Constructive feedback that explains corrections
6. Error handling for LLM failures
7. Evaluation results stored for analysis

## Story 3.3: ELO Rating System Implementation
As a user,
I want my level to adapt based on my performance,
so that I receive appropriately challenging exercises.

**Acceptance Criteria:**
1. ELO algorithm implemented for user level adjustment
2. Users start at lowest level with initial calibration
3. Small increments for level changes (except during calibration)
4. Medium-high stability for expression/exercise ratings
5. Algorithm handles edge cases and extreme scores
6. Level changes logged for analysis
7. Performance optimized for real-time updates

## Story 3.4: Practice Session Flow
As a user,
I want to practice one exercise at a time with clear navigation,
so that I can focus on learning without distractions.

**Acceptance Criteria:**
1. Single exercise display with clear question and answer input
2. "Next Exercise" button for navigation
3. Immediate feedback display after answer submission
4. Loading indicators during AI evaluation
5. Error handling for network issues
6. Session state maintained during practice
7. Clean, distraction-free interface

---
