# Technical Assumptions

## Repository Structure: Monorepo
- Single Convex app with modular frontend
- Shared components and utilities
- Unified deployment and testing strategy

## Service Architecture: Serverless (Convex)
- Convex functions for all backend operations
- API-like architecture with independent functions
- Serverless deployment for scalability
- Real-time capabilities through Convex

## Testing Requirements: Unit + Integration
- Unit tests for core business logic (ELO algorithm, exercise selection)
- Integration tests for LLM API interactions
- Manual testing convenience methods for debugging
- Quality assurance for AI-generated content

## Additional Technical Assumptions and Requests:
- **Frontend:** React with TypeScript, Shadcn UI with custom theme
- **Backend:** Convex (database, functions, authentication)
- **LLM Integration:** Separate models for content generation (quality) and evaluation (cost-effective)
- **Database:** Convex's built-in database with defined collections
- **Deployment:** Convex hosting and deployment
- **Development:** Functions exposed to window object for console debugging
- **Performance:** Sub-2-second response times for AI evaluation
- **Security:** Convex security features, secure LLM API handling

---
