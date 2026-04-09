---
name: llm-integration
description: |
  LLM API 集成模式 — OpenAI/Claude SDK、Prompt 管理、Token 优化、流式响应、错误处理。
  TRIGGER when: 集成 LLM API、实现 AI 功能、Prompt 工程、Token 管理。
paths: "**/llm/**,**/ai/**,**/chat/**"
effort: high
---

# LLM 集成模式

大语言模型 API 集成的生产级模式。

## 触发场景

- 集成 OpenAI / Claude / 本地模型 API
- 实现 Chat、Completion、Embedding 功能
- Prompt 模板管理与版本控制
- Token 预算管理
- 流式响应处理
- LLM 调用的错误处理与重试

## 技术选型

| 场景 | Java 方案 | Python 方案 |
|------|-----------|-------------|
| OpenAI API | `openai-java` | `openai` SDK |
| Claude API | `anthropic-java` | `anthropic` SDK |
| 本地模型 | Ollama Java Client | `ollama` / `llama-cpp-python` |
| Embedding | `openai-java` / `pgvector` | `sentence-transformers` |
| 流式响应 | Spring WebFlux + SSE | FastAPI `StreamingResponse` |

## Prompt 管理模式

### 模板化（推荐）

```java
// Java: Prompt 模板类
public record ChatPrompt(
    String system,
    String user,
    @Nullable String context,
    @Nullable List<ChatMessage> history
) {
    public String formatUser() {
        if (context != null) {
            return """
                Context: %s

                Question: %s
                """.formatted(context, user);
        }
        return user;
    }
}
```

```python
# Python: Prompt 模板
from pydantic import BaseModel

class ChatPrompt(BaseModel):
    system: str
    user: str
    context: str | None = None
    history: list[dict] | None = None

    def format_user(self) -> str:
        if self.context:
            return f"Context: {self.context}\n\nQuestion: {self.user}"
        return self.user
```

### 版本控制

```
prompts/
  v1/
    chat-agent.prompt.yaml
    summarizer.prompt.yaml
  v2/
    chat-agent.prompt.yaml   # 优化后版本
```

## Token 预算管理

```java
// Token 预算估算
public class TokenBudget {
    private static final int CHARS_PER_TOKEN = 4; // 粗略估算

    public static int estimateTokens(String text) {
        return text.length() / CHARS_PER_TOKEN;
    }

    public static boolean withinBudget(String prompt, int maxTokens) {
        return estimateTokens(prompt) < maxTokens * 0.8; // 留 20% 余量
    }
}
```

## 流式响应

```java
// Spring WebFlux SSE
@GetMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ChatChunk> streamChat(@RequestBody ChatRequest request) {
    return llmService.streamChat(request)
        .onErrorResume(e -> Flux.just(ChatChunk.error(e.getMessage())));
}
```

```python
# FastAPI StreamingResponse
from fastapi.responses import StreamingResponse

@app.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    async def generate():
        async for chunk in llm_service.stream_chat(request):
            yield f"data: {chunk.json()}\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")
```

## 错误处理与重试

```java
// 指数退避重试
@Retryable(
    value = {LlmApiException.class, RateLimitException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2)
)
public ChatResponse chat(ChatRequest request) {
    try {
        return llmClient.chat(request);
    } catch (LlmApiException e) {
        log.error("llm_api_error model={} error={}", request.model(), e.getMessage());
        throw e;
    }
}
```

## 安全要求

- API Key 通过环境变量注入，禁止硬编码
- 用户输入必须经过 sanitization 后才能进入 Prompt
- 记录 Token 消耗用于成本追踪
- 敏感数据不进入 Prompt

## 反模式（禁止）

- ❌ 直接拼接用户输入到 Prompt（Prompt Injection 风险）
- ❌ 硬编码 API Key
- ❌ 无超时设置的 LLM 调用
- ❌ 无重试机制的 API 调用
- ❌ 无成本追踪的 LLM 使用
