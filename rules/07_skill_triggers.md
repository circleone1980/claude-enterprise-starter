# 技能触发规则

> 确保所有 Agent 在合适的时机调用正确的技能

---

## Why: 为什么需要技能触发规则

技能存在但未被调用，会导致：
- 开发偏离最佳实践
- 效率低下（重复造轮子）
- 质量问题（跳过验证步骤）
- 协作混乱（缺乏系统化流程）

---

## 一、设计阶段触发规则

### 1.1 方案探索与选型

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| 遇到**设计困惑/方案选型** | `Skill brainstorming` | 所有角色 |
| PM/PO 发现**产品方向偏离** | `Skill brainstorming` → `Skill product-requirements` | PM, PO |
| Architect 发现**技术选型困难** | `Skill brainstorming` | Architect |
| UI Designer 遇到**设计选择困难** | `Skill brainstorming` | UI Designer |

### 1.2 架构设计完成

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| Architect 完成**架构设计初稿** | `Skill writing-plans` | Architect |
| Architect 需要创建**实施计划** | `Skill writing-plans` | Architect |
| PM 需要创建**Sprint 计划** | `Skill sprint-planning` | PM |
| **UI 风格选择**（项目初始或新模块） | `Skill ui-style-selector` | Architect, UI Designer |

---

## 二、开发阶段触发规则

### 2.1 开始实现功能

| 角色 | 必调技能 | 辅助技能 |
|------|---------|---------|
| **Frontend** | `Skill tdd` 🔴 | `Skill ui-ux-pro-max --stack react` |
| **Backend-Java** | `Skill springboot-tdd` 🔴, `Skill springboot-patterns` 🔴 | `Skill jpa-patterns`, `Skill springboot-security`, `Skill llm-integration`, `Skill vlm-integration`, `Skill workflow-engine` |
| **Backend-Python** | `Skill tdd` 🔴 | `Skill prisma-database-setup`, `Skill llm-integration`, `Skill vlm-integration`, `Skill workflow-engine` |
| **QA** | `Skill tdd` | `Skill verification-loop` 🔴, `Skill security-review`, `Skill product-requirements` |

**标准开发流程**：
```bash
# Frontend 标准
1. Skill ui-ux-pro-max --stack react  # 获取 UI 最佳实践
2. Skill tdd                           # 启动 TDD 流程
3. 编写测试用例（Red 阶段）
4. 实现组件代码（Green 阶段）
5. 重构优化（Refactor 阶段）

# Backend-Java 标准
1. Skill springboot-patterns           # 获取 SpringBoot 架构指导
2. Skill springboot-tdd                # 启动 TDD 流程（JUnit 5）
3. 编写测试用例（Red 阶段）
4. 实现代码（Green 阶段）
5. 重构优化（Refactor 阶段）
6. IF 安全相关 → Skill springboot-security
7. IF AI 功能 → Skill llm-integration / vlm-integration
8. IF 工作流 → Skill workflow-engine

# Backend-Python 标准
1. Skill prisma-database-setup        # 获取数据库配置指导
2. Skill tdd                           # 启动 TDD 流程（pytest）
3. 编写测试用例（Red 阶段）
4. 实现代码（Green 阶段）
5. 重构优化（Refactor 阶段）
6. IF AI 功能 → Skill llm-integration / vlm-integration
7. IF 工作流 → Skill workflow-engine
```

### 2.2 遇到问题

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| Frontend 遇到 **Bug** | `Skill systematic-debugging` | Frontend |
| Backend 遇到 **Bug** | `Skill systematic-debugging` | Backend |
| QA 发现 **Bug** | `Skill systematic-debugging` | QA |
| 任何角色**卡住超过 15 分钟** | `Skill brainstorming` | 所有角色 |

### 2.3 完成功能实现

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| Frontend/Backend **完成代码编写** | `Skill code-review` 🔴 | Frontend, Backend |
| 涉及**安全敏感代码**（认证、加密、SQL） | `Skill security-review` 🔴 ⚡ | Backend, DevOps |
| 功能实现完成，准备提交 | `Skill verification-before-completion` 🔴 | 所有开发角色 |

---

## 三、测试阶段触发规则

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| QA **开始测试** | `Skill tdd`（了解测试策略） | QA |
| QA 发现 **Bug** | `Skill systematic-debugging` | QA |
| 测试完成后 | `Skill code-review`（审查测试代码） | QA |

---

## 四、部署阶段触发规则

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| DevOps **准备部署** | `Skill verification-before-completion` | DevOps |
| DevOps 涉及**安全敏感操作** | `Skill security-review` ⚡ | DevOps |

---

## 五、并行开发与协调

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| 需要**多个 Agent 并行开发** | `Skill dispatching-parallel-agents` | Architect, PM |
| 需要将任务**委托给子代理** | `Skill subagent-driven-development` | 所有角色 |
| 需要使用 **Git worktrees** | `Skill using-git-worktrees` | 所有角色 |

---

## 六、持续学习与改进

| 触发场景 | 调用技能 | 适用角色 |
|---------|---------|---------|
| 发现**可复用模式** | `Skill continuous-learning` | 所有角色 |
| 需要创建**新技能** | `Skill writing-skills` | Architect |

---

## 七、Agent Prompt 标准模板

每个 Agent 的 prompt 必须包含以下动态技能调用指令：

```bash
Agent --name "{角色名称}" \
  --subagent-type "{对应类型}" \
  --prompt "你是{角色}。必须遵循以下流程：
    1. 🔴 调用 Skill design-context --role {角色} 获取设计约束
    2. 🔴 遇到设计困惑 → 调用 Skill brainstorming
    3. 🔴 开始开发 → 调用 Skill tdd
    4. 🔴 遇到 Bug → 调用 Skill systematic-debugging
    5. 🔴 完成代码 → 调用 Skill verification-before-completion
    6. 🔴 完成后 → 调用 Skill code-review
    7. {角色特定技能调用}
    任务：..."
```

### 角色特定技能调用

| 角色 | 角色特定技能 |
|------|------------|
| **Frontend** | 开始时调用 `Skill ui-ux-pro-max --stack react` |
| **Backend-Java** | 开始时调用 `Skill springboot-patterns`，数据访问时调用 `Skill jpa-patterns` |
| **Backend-Python** | 开始时调用 `Skill prisma-database-setup`，AI 功能时调用 `Skill llm-integration` |
| **QA** | 开始时调用 `Skill tdd`（了解测试策略），验证时调用 `Skill verification-loop` |
| **Architect** | 完成设计初稿后调用 `Skill writing-plans` |
| **DevOps** | 涉及安全操作时调用 `Skill security-review` |

---

## 八、技能优先级

当多个技能可能同时适用时，按以下顺序调用：

1. **Process skills**（流程技能）: `brainstorming`, `systematic-debugging` — 决定 HOW to approach
2. **Implementation skills**（实现技能）: `tdd`, `backend-patterns` — 指导 execution

**示例**：
- "Let's build X" → `brainstorming` first, then `tdd`
- "Fix this bug" → `systematic-debugging` first, then domain-specific skills

---

## 九、技能类型分类

| 类型 | 技能 | 使用方式 |
|------|------|---------|
| **Rigid（刚性）** | `tdd`, `systematic-debugging` | 严格遵循，不要跳过步骤 |
| **Flexible（灵活）** | `brainstorming`, `backend-patterns` | 根据上下文适配原则 |

---

## 十、内置技能触发规则

Claude Code 内置技能无需安装，直接通过 `/` 命令调用：

| 触发场景 | 内置技能 | 适用角色 | 说明 |
|---------|---------|---------|------|
| 大规模重构（涉及 5+ 文件） | `/batch` | Architect, PM | 自动拆解任务、创建独立分支、并行处理 |
| 完成代码审查后 | `/simplify` | Frontend, Backend | 三个代理并行审查代码质量 |
| 代码合并前最终检查 | `/simplify` | QA, DevOps | 最终质量检查 |
| 按间隔监控任务 | `/loop` | DevOps | 定期检查部署状态等 |
| 加载 Claude API 参考 | `/claude-api` | Backend | 当代码导入 `anthropic` SDK 时自动触发 |

---

## 十一、全局阶段流程图

### Phase 1: 需求分析

```
前置: 项目初始化完成
显式调用:
  PM → /product-requirements (effort:high) → /sprint-planning (effort:medium)
  PO → /product-requirements (effort:high) → /user-onboarding (effort:high)
  Architect → /writing-plans (effort:high) → /ui-style-selector (确认视觉方向)
自动激活: 无（设计文档阶段无代码文件）
完成: 冻结层文档通过门禁验证
```

### Phase 2: 开发实现

```
前置: Phase 1 门禁通过
显式调用:
  Frontend → /design-context → /ui-ux-pro-max → /antfu → /tdd → 开发 → /code-review (effort:high) → /simplify
  Backend-Java → /design-context → /springboot-patterns → /springboot-tdd → 开发 → /code-review (effort:high) → /simplify
  Backend-Python → /design-context → /prisma-database-setup → /tdd → 开发 → /code-review (effort:high) → /simplify
自动激活 (paths):
  编辑 .tsx/.jsx → react-best-practices + antfu + ui-ux-pro-max 自动考虑加载
  编辑 .prisma → prisma-database-setup 自动考虑加载
内置: 大型重构(5+文件) → /batch
完成: 所有 Feature 编译通过 + 测试通过 + code-review 通过
```

### Phase 3: 测试验证

```
前置: Phase 2 门禁通过
显式调用: QA → /design-context → /tdd → 测试 → /code-review
完成: 测试覆盖率 >80% + 无 P0/P1 Bug
```

### Phase 4: 产品体验

```
前置: Phase 3 门禁通过
显式调用: 产品体验师 → /design-context → /user-onboarding (effort:high) → /ui-ux-pro-max
完成: 体验评估通过
```

### Phase 5: 部署发布

```
前置: Phase 4 门禁通过
显式调用: DevOps → /design-context → /code-review → /simplify (合并前最终检查)
完成: 部署成功 + 无回滚
```

---

> **图例**: 🔴 = 强制调用 | ⚡ = External skill（非本项目内置，需额外安装或通过 Superpowers 提供）

*加载顺序: 07*
