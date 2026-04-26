# 全生命周期执行计划（Lifecycle Execution Plan）

> 版本: 4.0.0
> 最后更新: 2026-04-27

---

## 执行方式

框架采用**半自动模式**：脚本生成可执行 prompt → 主会话读取并执行。

```bash
# 1. 运行 orchestrate.sh 生成 prompt
bash scripts/orchestrate.sh --phase=0

# 2. 读取生成的 prompt 文件
cat .claude/logs/phase-0-prompt.md

# 3. 主会话执行 prompt 中的 Agent/Skill 调用
# 4. 运行 gap-detector 检查
node scripts/gap-detector.js --phase=0
```

---

## Phase 0: 头脑风暴

| 项目 | 内容 |
|------|------|
| **Agent** | Brainstormer（`everything-claude-code:planner`） |
| **核心 Skill** | `ce-brainstorm`, `design-context` |
| **产出物** | `docs/brainstorms/{date}-{topic}.md` |
| **过程追踪** | `docs/process-trace/phase0/001-brainstorm.md` |
| **门禁** | brainstorm notes 存在 + `.user-confirmed` 存在 |
| **人工介入** | **必须** — 用户确认方向后才能进入 Phase 1 |

### 执行 prompt 模板

```
调用 Agent 工具，参数如下:
- description: "Phase 0 头脑风暴"
- subagent_type: "everything-claude-code:planner"
- prompt: |
    你是 Brainstormer（头脑风暴师）。遵循 agents/brainstormer.md 的 SOP。
    1. 调用 Skill ce-brainstorm 开启头脑风暴
    2. 与用户交互式讨论产品定位、假设、技术路线
    3. 对关键决策给出 ≥2 种方案对比
    4. 输出到 docs/brainstorms/ 目录
    5. 创建过程追踪 docs/process-trace/phase0/001-brainstorm.md
    任务：与用户讨论数字人项目的需求方向
```

---

## Phase 1: 需求分析

| 项目 | 内容 |
|------|------|
| **Agent Team** | PM + PO + Architect（Team 模式，score ≥ 6） |
| **核心 Skill** | PM→`product-requirements`, Architect→`writing-plans` |
| **产出物** | PRD、用户故事、验收标准、4 份设计文档 |
| **对抗审查** | Review Champion × 4（并行，adversarial-review） |
| **过程追踪** | `docs/process-trace/phase1/001-008.md` |
| **门禁** | 13 项条件 + 过程追踪 + 对抗审查 |
| **人工介入** | **必须** — 文档冻结审批 |

### 执行 prompt 模板

```
1. 创建 Team:
   TeamCreate({ team_name: "phase1-requirements", description: "Phase 1 需求分析" })

2. 创建任务并分配给 PM、PO、Architect

3. 启动 PM Agent:
   Agent({
     name: "PM", subagent_type: "everything-claude-code:planner",
     team_name: "phase1-requirements",
     prompt: "你是 PM。遵循 agents/pm.md 的 SOP。调用 Skill product-requirements 生成 PRD。"
   })

4. 完成后启动对抗审查:
   Agent({
     name: "Review-Champion-PRD", subagent_type: "general-purpose",
     prompt: "执行对抗审查。调用 Skill adversarial-review 检查 PRD.md"
   })
```

---

## Phase 2: 开发

| 项目 | 内容 |
|------|------|
| **Agent Team** | Frontend ×2 + Backend-Python ×1 + UI-Designer ×1 |
| **核心 Skill** | `tdd`, `ce-work`, `code-review` |
| **产出物** | 前端（React+Three.js）+ 后端（FastAPI+WebSocket）+ 测试 |
| **过程追踪** | `docs/process-trace/phase2/` |
| **门禁** | 代码完成 + 覆盖率 >80% + Code Review + 过程追踪 |
| **人工介入** | Code Review 审批 |

---

## Phase 3: 测试

| 项目 | 内容 |
|------|------|
| **Agent** | QA（`everything-claude-code:tdd-guide`） |
| **核心 Skill** | `verification-loop`, `code-review`, `security-review` |
| **产出物** | 测试报告、E2E 结果 |
| **门禁** | 所有测试通过 |

---

## Phase 4: 产品体验

| 项目 | 内容 |
|------|------|
| **Agent** | 产品体验师（`everything-claude-code:planner`） |
| **核心 Skill** | `user-onboarding`, `ui-ux-pro-max` |
| **产出物** | UX 报告 |
| **门禁** | 体验评估通过 |

---

## Phase 5: 部署

| 项目 | 内容 |
|------|------|
| **Agent** | DevOps（`general-purpose`） |
| **核心 Skill** | `code-review`, `security-review` |
| **产出物** | Docker Compose 部署 + 健康检查 |
| **门禁** | 部署成功 + 文档更新 |

---

## 迭代协议

```
LOOP for each Phase:
  1. bash scripts/orchestrate.sh --phase=N --interactive
  2. 读取 .claude/logs/phase-N-prompt.md
  3. 执行 prompt 中的 Agent/Skill 调用
  4. node scripts/gap-detector.js --phase=N
  5. IF 有缺口:
     a. 分析根因 → 修复框架文件
     b. 重新执行该 Phase
     c. 回到步骤 4
  6. IF 无缺口:
     a. 门禁通过
     b. 人工审批（requireApproval: true 的阶段）
     c. 进入 Phase N+1
```

---

*文档版本: 1.0.0*
*最后更新: 2026-04-27*
