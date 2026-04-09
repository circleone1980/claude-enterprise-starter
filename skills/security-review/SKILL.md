---
name: security-review
description: |
  安全审查 — 10 个安全域检查 + 部署前安全清单。
  TRIGGER when: 添加认证、处理用户输入、创建 API 端点、涉及支付/敏感数据。
origin: ECC
effort: high
---

# Security Review（安全审查）

10 个安全域的全面检查清单。

## 触发场景

- 添加认证/授权功能
- 处理用户输入
- 创建 API 端点
- 涉及支付/敏感数据
- 部署前安全检查

## 10 个安全域

### 1. 密钥管理

```java
// FAIL: 硬编码密钥
String apiKey = "sk-abc123...";

// PASS: 环境变量
@Value("${api.key}")
String apiKey;
```

```python
# FAIL
api_key = "sk-abc123..."

# PASS
import os
api_key = os.environ["API_KEY"]
```

检查项：
- [ ] 无硬编码密钥、token、密码
- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 使用 Vault 或环境变量管理密钥

### 2. 输入验证

```typescript
// PASS: Zod schema 验证
import { z } from 'zod';
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});
```

检查项：
- [ ] 所有用户输入经过验证
- [ ] 文件上传验证（大小、类型、扩展名）
- [ ] 拒绝过大/畸形输入

### 3. SQL 注入防护

```java
// FAIL: 字符串拼接
"SELECT * FROM users WHERE name = '" + name + "'"

// PASS: 参数化查询
@Query("SELECT u FROM User u WHERE u.name = :name")
```

### 4. 认证与授权

```java
// PASS: JWT 验证
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(...) {
        String token = extractToken(request);
        Authentication auth = jwtService.validate(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
        chain.doFilter(request, response);
    }
}
```

检查项：
- [ ] JWT/Token 正确验证和过期
- [ ] 敏感端点有权限守卫
- [ ] Session 使用 httpOnly + Secure cookie

### 5. XSS 防护

```typescript
// FAIL: 直接插入 HTML
element.innerHTML = userInput;

// PASS: 文本内容
element.textContent = userInput;

// PASS: DOMPurify 净化
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 6. CSRF 防护

- SPA + Bearer Token: 可禁用 CSRF
- 传统表单: 必须启用 CSRF Token
- Cookie: `SameSite=Strict`

### 7. 速率限制

```java
// PASS: Bucket4j 速率限制
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(...) {
        Bucket bucket = buckets.computeIfAbsent(clientIp,
            k -> Bucket.builder()
                .addLimit(Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))))
                .build());
        if (!bucket.tryConsume(1)) {
            response.setStatus(429);
            return;
        }
        chain.doFilter(request, response);
    }
}
```

### 8. 敏感数据暴露

- 日志中不记录密码、token、PII
- 错误消息不暴露内部实现细节
- API 响应不返回不必要的数据

### 9. 依赖安全

```bash
npm audit          # Node.js
pip audit          # Python
mvn org.owasp:dependency-check:check  # Java
```

### 10. 文件上传安全

- 验证文件类型（MIME + 扩展名双重验证）
- 限制文件大小
- 存储在 Web 根目录外
- 重命名上传文件（防止路径遍历）

## 部署前安全清单

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | 密钥通过环境变量管理 | ☐ |
| 2 | 所有输入经过验证 | ☐ |
| 3 | 无 SQL 注入风险 | ☐ |
| 4 | XSS 防护到位 | ☐ |
| 5 | CSRF 配置正确 | ☐ |
| 6 | 认证/授权守卫完整 | ☐ |
| 7 | 速率限制已配置 | ☐ |
| 8 | HTTPS 强制使用 | ☐ |
| 9 | 安全头已配置（CSP, X-Frame-Options） | ☐ |
| 10 | 错误处理不泄露敏感信息 | ☐ |
| 11 | 日志不包含敏感数据 | ☐ |
| 12 | 依赖已扫描无已知漏洞 | ☐ |
| 13 | 文件上传安全检查 | ☐ |
| 14 | CORS 配置正确（非 *） | ☐ |
| 15 | 数据库连接使用最小权限 | ☐ |
