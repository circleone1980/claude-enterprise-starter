# Agent Team 快速启动模板

---

## 使用说明

1. 复制此模板到项目
2. 修改 `PROJECT_NAME` 和 `TEAM_NAME`
3. 执行命令启动团队

---

## Step 1: 创建团队

```bash
TeamCreate --team-name "PROJECT-Dev-Team" --description "项目开发团队"
```

---

## Step 2: 创建任务

```bash
TaskCreate --subject "Sprint 1 开发任务" --description "详细任务描述"
```

---

## Step 3: 启动 PM

```bash
Agent --name "PM" \
  --subagent-type "everything-claude-code:planner" \
  --prompt "你是项目经理。
    1. 调用 Skill writing-plans
G; Skill product-requirements 分析需求
    2. 调用 Skill autoplan 进行任务规划
    3. 使用 TaskCreate 创建任务列表
    4. 使用 TaskUpdate 分配任务给对应角色
    5. 监控进度并处理阻塞
    任务：[PROJECT_NAME] 项目 Sprint 1 开发"
```

---

## Step 4: 启动 PO

```bash
Agent --name "PO" \
  --subagent-type "general-purpose" \
  --prompt "你是产品经理。
    1. 调用 Skill writing-plans
G; Skill product-requirements 进行需求拆解
    2. 调用 Skill autoplan 确定优先级
    3. 调用 Skill user-onboarding 设计用户引导策略
    4. 按 Business Capability → Product Feature → System Capability → Technical Implementation 拆解
    5. 编写 PRD 和用户故事
    6. 定义验收标准
    任务：[PROJECT_NAME] 产品需求分析"
```

---

## Step 5: 启动 Architect

```bash
Agent --name "Architect" \
  --subagent-type "everything-claude-code:architect" \
  --prompt "你是架构师（Staff/Principal Engineer Level）。
    1. 调用 Skill writing-plans
G; Skill product-requirements 理解需求上下文
    2. 🔴 调用 Skill react-best-practices 获取 React 架构最佳实践（如涉及 React）
    3. 调用 Skill ui-ux-pro-max 获取 UI/UX 架构指导（如涉及 UI）
    4. 设计系统架构（高可用、高可扩展、高可维护、高安全、高性能）
    5. 调用 Skill code-review 审查架构设计
    6. 输出 ADR (Architecture Decision Records)
    任务：[PROJECT_NAME] 系统架构设计"
```

---

## Step 6: 启动 UI 设计师

```bash
Agent --name "UI-Designer" \
  --subagent-type "general-purpose" \
  --prompt "你是 UI 设计师。必须遵循以下流程：
    1. 🔴 调用 Skill ui-ux-pro-max --design-system 获取设计系统指导
    2. 使用 Figma MCP get_design_context 获取设计上下文
    3. 生成符合 ui-ux-pro-max 最佳实践的 UI 组件
    4. 输出设计规范文档
    任务：[PROJECT_NAME] UI 设计"
```

---

## Step 7: 启动开发团队（并行）

```bash
# 后端开发
Agent --name "Backend-1" \
  --subagent-type "everything-claude-code:python-reviewer" \
  --prompt "你是后端开发。必须遵循 TDD 流程：
    1. 🔴 调用 Skill tdd 启动 TDD（垂直切片模式）
    2. 编写测试（Red）
    3. 实现代码（Green）
    4. 重构（Refactor）
    5. 调用 Skill code-review 审查代码
    6. 如涉及数据库，使用 database-reviewer 审查 SQL
    7. 确保测试覆盖率 >80%
    任务：[具体任务描述]"

# 前端开发
Agent --name "Frontend-1" \
  --subagent-type "everything-claude-code:typescript-reviewer" \
  --prompt "你是前端开发。必须遵循 TDD 流程：
    1. 调用 Skill ui-ux-pro-max --stack react 获取 React 最佳实践
    2. 🔴 调用 Skill tdd 启动 TDD（垂直切片模式）
    3. 🔴 调用 Skill vitest 配置 Vitest 测试框架
    4. 编写测试（Red）
    5. 实现代码（Green）
    6. 重构（Refactor）
    7. 调用 Skill code-review 审查代码
    8. 确保测试覆盖率 >80%
    任务：[具体任务描述]"
```

---

## Step 8: 启动 QA

```bash
Agent --name "QA" \
  --subagent-type "everything-claude-code:tdd-guide" \
  --prompt "你是测试工程师。
    1. 调用 Skill tdd 验证测试方法论
    2. 调用 Skill code-review 审查测试代码
    3. 验证测试覆盖率 >80%
    4. 运行集成测试
    5. 使用 Playwright MCP 运行 E2E 测试
    6. 输出测试报告
    任务：[PROJECT_NAME] 测试验证"
```

---

## Step 9: 启动 DevOps

```bash
Agent --name "DevOps" \
  --subagent-type "general-purpose" \
  --prompt "你是运维工程师。
    1. 调用 Skill code-review 审查部署脚本和配置
    2. 使用 GitHub MCP 管理仓库
    3. 配置 CI/CD 流水线
    4. 配置 Docker 容器化
    5. 执行部署并验证
    任务：[PROJECT_NAME] 部署配置"
```

---

## Step 10: 启动产品体验师

```bash
Agent --name "产品体验师" \
  --subagent-type "everything-claude-code:planner" \
  --prompt "你是产品体验师。必须遵循以下流程：
    1. 🔴 调用 Skill user-onboarding 设计用户引导（FTUE/激活/Aha moment）
    2. 调用 Skill writing-plans
G; Skill product-requirements 理解产品功能
    3. 调用 Skill ui-ux-pro-max 获取 UX 评估标准
    4. 使用 Playwright MCP 模拟用户操作
    5. 从易用性、效率、一致性、可发现性、容错性、可访问性维度评估
    6. 发现交互痛点、流程断点、认知负担
    7. 输出 Onboarding & Activation Pack
    任务：[PROJECT_NAME] 用户体验测试"
```

---

## Step 11: 分配任务

```bash
TaskUpdate --taskId "1" --owner "Backend-1"
TaskUpdate --taskId "2" --owner "Frontend-1"
TaskUpdate --taskId "3" --owner "QA"
```

---

## 技能映射速查表

| 角色 | 核心技能 🔴 | 辅助技能 | Agent 类型 |
|------|------------|---------|-----------|
| PM | `product-requirements` | `autoplan` | planner |
| PO | `product-requirements` | `autoplan`, `user-onboarding` | general-purpose |
| Architect | `writing-plans` 🔴, `react-best-practices` 🔴 | `product-requirements`, `ui-ux-pro-max`, `code-review` | architect |
| UI Designer | `ui-ux-pro-max` 🔴 | Figma MCP | general-purpose |
| Frontend | `tdd` 🔴, `vitest` 🔴 | `ui-ux-pro-max --stack react`, `code-review` | typescript-reviewer |
| Backend | `tdd` 🔴 | `code-review`, database-reviewer | python-reviewer |
| QA | `tdd` | `code-review`, Playwright MCP | tdd-guide |
| DevOps | `code-review` | GitHub MCP | general-purpose |
| 产品体验师 | `user-onboarding` 🔴 | `product-requirements`, `ui-ux-pro-max`, Playwright MCP | planner |

---

## 全自动模式（狂暴模式）

创建团队后自动启动所有 Agent：

```bash
# 一键启动
TeamCreate --team-name "PROJECT-Dev-Team" --description "项目开发团队"
# 狂暴模式 Hook 自动启动所有角色
```

---

*模板版本: 1.0.2*
*最后更新: 2026-04-12*
