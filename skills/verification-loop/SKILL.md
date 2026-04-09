---
name: verification-loop
description: |
  综合验证系统 — 代码变更后或 PR 前执行 Build→TypeCheck→Lint→Tests→Security→DiffReview。
  TRIGGER when: 完成功能开发、提交前验证、PR 审查前。
origin: ECC
effort: medium
---

# Verification Loop（验证循环）

代码变更后的综合验证系统。

## 触发场景

- 完成一个功能/模块的开发
- 准备提交代码或创建 PR
- 合并前质量检查
- 每 15 分钟自动验证（长时间会话）

## 6 阶段验证流程

### Phase 1: Build（构建）

```bash
# 前端
pnpm build

# Java 后端
mvn compile -T 4

# Python 后端
python -m build  # 或直接验证 import
```

**停止条件**: 构建失败 → 立即修复，不继续后续阶段

### Phase 2: Type Check（类型检查）

```bash
# TypeScript
npx tsc --noEmit

# Python
pyright .  # 或 mypy .

# Java
mvn compile  # Maven 编译即类型检查
```

**停止条件**: Critical 类型错误必须修复

### Phase 3: Lint（代码规范）

```bash
# 前端
pnpm lint

# Python
ruff check .

# Java
mvn spotless:check  # 或 checkstyle:check
```

**处理方式**: 报告 Warning，Critical 级别必须修复

### Phase 4: Tests（测试）

```bash
# 前端
pnpm test -- --coverage

# Python
pytest --cov --cov-report=term-missing

# Java
mvn test -T 4
```

**目标**: 覆盖率 >80%

### Phase 5: Security（安全扫描）

扫描模式：
- `sk-`, `api_key`, `secret`, `password` 等密钥泄露
- `console.log`, `print()`, `System.out.println` 等调试语句
- `.env` 文件是否被意外包含

```bash
# 快速检查
grep -rn "console\.\(log\|debug\)" --include="*.ts" --include="*.tsx" src/
grep -rn "sk-\|api_key\|secret_key" --include="*.ts" --include="*.py" --include="*.java" .
```

### Phase 6: Diff Review（变更审查）

```bash
git diff --stat
git diff --name-only
```

审查每个变更文件：
- 变更是否合理
- 是否有遗漏的文件
- 是否有不应该提交的文件

## 输出格式

```
═══════════════════════════════════════════════════════
VERIFICATION REPORT
═══════════════════════════════════════════════════════
Phase 1: Build        ✅ PASS (0 errors)
Phase 2: Type Check   ✅ PASS (0 errors)
Phase 3: Lint         ⚠️  WARNING (3 warnings)
Phase 4: Tests        ✅ PASS (42/42 tests, 87% coverage)
Phase 5: Security     ✅ PASS (0 issues)
Phase 6: Diff Review  ✅ PASS (5 files changed)
───────────────────────────────────────────────────────
OVERALL: ✅ READY FOR COMMIT
═══════════════════════════════════════════════════════
```

## 持续模式

长时间会话中，建议每 15 分钟或每次重大变更后运行验证：
```
/verify — 手动触发验证循环
```
