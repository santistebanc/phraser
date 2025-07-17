# LLM Integration Strategy

## Provider Selection

**Primary Choice:** OpenAI GPT-4 for content generation, GPT-3.5-turbo for evaluation
**Fallback:** Anthropic Claude for evaluation if cost optimization needed
**Rationale:** GPT-4 provides highest quality for content generation, GPT-3.5-turbo is cost-effective for evaluation

## Integration Patterns

### Content Generation (GPT-4)
```typescript
// convex/lib/llm.ts
export const generateExpression = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a German language expert..." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500
  });
  return response.choices[0].message.content;
};
```

### Answer Evaluation (GPT-3.5-turbo)
```typescript
export const evaluateAnswer = async (
  question: string, 
  correctAnswer: string, 
  userAnswer: string
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Evaluate German translation answers..." },
      { role: "user", content: `Question: ${question}\nCorrect: ${correctAnswer}\nUser: ${userAnswer}` }
    ],
    temperature: 0.3,
    max_tokens: 200
  });
  return parseEvaluation(response.choices[0].message.content);
};
```

## Cost Optimization Strategy

1. **Separate Models:** GPT-4 for generation (quality), GPT-3.5-turbo for evaluation (cost)
2. **Caching:** Cache generated content to avoid regeneration
3. **Batch Processing:** Generate multiple exercises in single API call
4. **Rate Limiting:** Implement intelligent rate limiting to stay within budget
5. **Fallback Strategy:** Switch to cheaper models if cost exceeds threshold

---
