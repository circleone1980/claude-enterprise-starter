---
name: code-review
description: |
  Systematic code review for quality, security, performance, and maintainability.
  
  TRIGGER when: user asks for code review, PR review, mentions "代码审查", "code review", "review", "check my code", "审查代码", "PR review", "merge review", or after completing any feature implementation.
  
  Use this skill after completing development work and before merging to main branch. Code review is mandatory - all code changes must be reviewed before commit.
---

# Code Review Checklist

A comprehensive framework for reviewing code changes.

## Review Dimensions

### 1. Code Quality

Evaluate structural and stylistic aspects:

- [ ] **Naming**: Variables, functions, classes have clear, descriptive names
- [ ] **Single Responsibility**: Each function/class does one thing well
- [ ] **DRY**: No duplicated code or logic
- [ ] **Comments**: Complex logic is explained, not obvious code
- [ ] **Formatting**: Consistent with project style guide
- [ ] **File Organization**: Related code grouped logically

### 2. Security

Check for common vulnerabilities:

- [ ] **Input Validation**: All user inputs are sanitized and validated
- [ ] **SQL Injection**: Using parameterized queries, not string concatenation
- [ ] **XSS Protection**: Output properly escaped/encoded
- [ ] **Authentication**: Proper session management
- [ ] **Authorization**: Permission checks in place
- [ ] **Sensitive Data**: No hardcoded credentials, proper encryption
- [ ] **Dependencies**: No known vulnerable packages

### 3. Performance

Identify potential bottlenecks:

- [ ] **Database Queries**: No N+1 problems, proper indexing
- [ ] **Caching**: Appropriate use of caching
- [ ] **Async Operations**: Long-running tasks are async
- [ ] **Resource Management**: Connections, files properly closed
- [ ] **Memory**: No memory leaks, efficient data structures
- [ ] **API Calls**: Batched where possible, proper timeout handling

### 4. Testing

Verify test coverage:

- [ ] **Unit Tests**: All new functions/methods tested
- [ ] **Integration Tests**: Component interactions tested
- [ ] **Edge Cases**: Boundary conditions covered
- [ ] **Error Paths**: Exception handling tested
- [ ] **Coverage**: Meets project threshold (>80%)
- [ ] **Test Quality**: Tests are meaningful, not just for coverage

### 5. Documentation

Ensure maintainability:

- [ ] **API Documentation**: Endpoints documented (OpenAPI/Swagger)
- [ ] **Code Comments**: Complex logic explained
- [ ] **README**: Updated if setup/usage changed
- [ ] **Changelog**: Breaking changes noted
- [ ] **Type Hints**: TypeScript/Python type annotations present

## Review Report Template

```markdown
# 代码审查报告

## 基本信息
- 审查人: [Reviewer]
- 审查时间: [Date]
- 审查范围: [Files/Modules]
- PR/Commit: [Reference]

## 总体评价
- 代码质量评分: X/10
- 建议合并: ✅ 是 / ⚠️ 需修改 / ❌ 否

## 问题列表

### 🔴 Critical (必须修复)
| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| 1 | ... | file.py:123 | ... |

### 🟡 Major (建议修复)
| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| 1 | ... | file.py:456 | ... |

### 🟢 Minor (可选修复)
| # | 问题 | 位置 | 建议 |
|---|------|------|------|
| 1 | ... | file.py:789 | ... |

## 亮点
- [Good practices observed]

## 建议改进
- [General improvement suggestions]
```

## Severity Guidelines

| Level | Criteria | Action |
|-------|----------|--------|
| 🔴 Critical | Security issue, data loss risk, crash | Must fix before merge |
| 🟡 Major | Performance issue, maintainability | Should fix before merge |
| 🟢 Minor | Style, minor optimization | Can be addressed later |

## Review Workflow

1. **Understand Context** - Read PR description, related issues
2. **Check Tests** - Verify tests pass and cover changes
3. **Review Code** - Go through each dimension systematically
4. **Document Findings** - Use report template
5. **Provide Feedback** - Be constructive, explain reasoning
6. **Verify Fixes** - Re-review after changes

## Tips for Effective Reviews

- Review in small batches (<400 lines)
- Focus on logic, not preferences
- Explain the "why" behind suggestions
- Acknowledge good practices
- Be respectful and constructive
