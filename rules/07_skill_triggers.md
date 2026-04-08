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

---

## 二、开发阶段触发规则

### 2.1 开始实现功能

| 角色 | 必调技能 | 辅助技能 |
|------|---------|---------|
| **Frontend** | `Skill tdd` 🔴 | `Skill ui-ux-pro-max --stack react` |
| **Backend** | `Skill tdd` 🔴 | `Skill database-migrations`, `Skill prisma-database-setup` |
| **QA** | `Skill tdd` | `Skill product-requirements`（了解测试策略） |

**标准开发流程**：
```bash
# Frontend 标准
1. Skill ui-ux-pro-max --stack react  # 获取 UI 最佳实践
2. Skill tdd                           # 启动 TDD 流程
3. 编写测试用例（Red 阶段）
4. 实现组件代码（Green 阶段）
5. 重构优化（Refactor 阶段）

# Backend 标准
1. Skill prisma-database-setup        # 获取数据库配置指导
2. Skill database-migrations           # 数据库迁移模式（如需）
3. Skill tdd                           # 启动 TDD 流程
4. 编写测试用例（Red 阶段）
5. 实现代码（Green 阶段）
6. 重构优化（Refactor 阶段）
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
| 涉及**安全敏感代码**（认证、加密、SQL） | `Skill security-review` 🔴 | Backend, DevOps |
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
| DevOps 涉及**安全敏感操作** | `Skill security-review` | DevOps |

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
| **Backend** | 开始时调用 `Skill prisma-database-setup`，如需迁移调用 `Skill database-migrations` |
| **QA** | 开始时调用 `Skill tdd`（了解测试策略） |
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

*加载顺序: 07*
