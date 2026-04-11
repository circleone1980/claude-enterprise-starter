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

## 7 阶段验证流程

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

### Phase 7: AC Coverage（验收标准覆盖）

检查本次变更是否满足关联的验收标准。

```bash
# 查看变更文件关联的 AC 状态
node scripts/ac-coverage-report.js --changed-files
```

**执行逻辑**:
1. 读取 `automation/ac-tracker.json`
2. 从 `git diff --name-only` 获取变更文件列表
3. 通过 AC 的 `testFile` 字段将变更映射到 Feature
4. 检查每个关联 AC 的状态

**停止条件**: 有 P0 AC 未 passed → 必须补充测试或修复实现

**输出示例**:
```
Phase 7: AC Coverage ✅ PASS (4/4 ACs verified)
  FEAT-001:
    AC-F001-01: ✅ passed (test: auth.spec.ts:15)
    AC-F001-02: ✅ passed (test: auth.spec.ts:32)
  FEAT-002:
    AC-F002-01: ⚠️ verified (no test file mapped)
    AC-F002-02: ❌ draft (test missing)
```

**AC 状态说明**:
| 状态 | 含义 | 验证动作 |
|------|------|---------|
| `draft` | AC 已定义但未开始 | 检查是否需要开发 |
| `approved` | AC 已审批 | 检查是否有开发任务 |
| `test_written` | 测试已编写 | 运行测试验证 |
| `verified` | AC 已验证通过 | 确认无回归 |
| `passed` | AC 最终通过 | 无需额外动作 |
| `failed` | AC 验证失败 | 必须修复 |

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
Phase 7: AC Coverage  ✅ PASS (4/4 ACs verified)
───────────────────────────────────────────────────────
OVERALL: ✅ READY FOR COMMIT
═══════════════════════════════════════════════════════
```

## 持续模式

长时间会话中，建议每 15 分钟或每次重大变更后运行验证：
```
/verify — 手动触发验证循环
```
