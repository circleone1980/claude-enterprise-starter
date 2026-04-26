# 开发约束

> 所有开发活动的约束规则

---

## 禁止行为

- ❌ 禁止 token 不足时简化代码
- ❌ 禁止硬编码
- ❌ 禁止数据 mock
- ❌ 禁止 MVP/Demo 级实现
- ❌ 禁止直接编写代码（必须: 规划 → TDD → 实现 → 审查）

## 代码规范

- 遵循阿里巴巴代码开发规范
- 有意义的变量名和函数名
- 函数单一职责

### 技术栈固定约束

前端技术栈固定为 React + TypeScript + Vite，禁止使用以下替代方案：
- ❌ Vue、Angular、Svelte 等非 React 框架
- ❌ Webpack（使用 Vite 替代）
- ❌ npm、yarn（使用 pnpm 替代）
- ❌ Jest（使用 Vitest 替代）

后端默认技术栈为 **Python/FastAPI**：
- Python 3.12+ / FastAPI / uv
- 测试: pytest + httpx
- AI SDK: OpenAI SDK / Anthropic SDK

如需使用 Java/Spring Boot，需通过 ADR 流程审批。
如需变更前端技术栈，必须通过 ADR 流程审批。

## TDD 流程（强制）

TDD 作为 `/ce-work` 核心执行引擎内的子流程执行：

1. **Red** - 先编写失败的测试用例
2. **Green** - 编写最小代码使测试通过
3. **Refactor** - 重构代码，保持测试通过

Phase 2 开发必须使用 `/ce-work` 驱动，TDD 在 ce-work 内自动执行。
ce-work 强制: 单任务迭代 → 自动进度笔记 → 阻塞点追踪 → 代码风格检查。

**覆盖率要求**: > 80%

## 代码注释标准（强制）

- 每个源文件必须有**模块头注释**（@version, @since, @module, Changelog）
- 每个公开函数必须有**中文注释**（JSDoc/Javadoc/docstring）
- 注释模板见 `templates/code-headers/`
- 详细规范见 [rules/08_code_comments.md](08_code_comments.md)

---

*加载顺序: 01*
