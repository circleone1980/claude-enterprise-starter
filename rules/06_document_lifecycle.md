# 文档生命周期规则

> 管理设计文档的创建、冻结、更新和 ADR 流程

---

## 一、文档分层体系

### 冻结层（Frozen Layer）— Phase 1 产出，Phase 2 开始前冻结

| 文档 | 路径 | 产出者 | 消费者 |
|------|------|--------|--------|
| 产品需求文档 | `docs/requirements/PRD.md` | PM + PO | 所有 Agent |
| 用户故事 | `docs/requirements/user-stories.md` | PO | Frontend, Backend, QA |
| 验收标准 | `docs/requirements/acceptance-criteria.md` | PO + PM | QA |
| 系统架构设计 | `docs/design/01_系统架构设计.md` | Architect | 所有开发 Agent |
| 数据库设计 | `docs/design/02_数据库设计.md` | Architect + Backend | Backend, QA |
| API 接口设计 | `docs/design/03_API接口设计.md` | Architect | Frontend, Backend, QA |
| UI 设计规范 | `docs/design/04_UI设计规范.md` | UI Designer | Frontend, 产品体验师 |

**冻结规则**: Phase 1 门禁通过后锁定，任何修改必须走 ADR 流程。

---

### 演化层（Evolution Layer）— 持续更新

| 文档 | 路径 | 产出者 | 更新时机 |
|------|------|--------|---------|
| 开发环境搭建 | `docs/dev/01_开发环境搭建.md` | DevOps | Phase 0 |
| 编码规范 | `docs/dev/02_编码规范.md` | Architect | Phase 1 |
| Git 工作流 | `docs/dev/03_Git工作流.md` | DevOps | Phase 0 |
| 测试计划 | `docs/test/01_测试计划.md` | QA | Phase 1 |
| 测试用例 | `docs/test/02_测试用例.md` | QA | Phase 3 |
| 验证记录 | `docs/test/03_验证记录.md` | QA | Phase 3 |
| 测试报告 | `docs/test/reports/TEST_REPORT.md` | QA | Phase 3 |
| CHANGELOG | `docs/fixes/CHANGELOG.md` | DevOps | 每次提交 |
| 修复记录 | `docs/fixes/{日期}-{主题}.md` | 对应 Agent | 修复时 |

**更新规则**: Agent 可自行更新，无需 ADR 审批。

---

### ADR 层（Architecture Decision Records）

| 文档 | 路径 | 触发者 |
|------|------|--------|
| ADR 模板 | `docs/superpowers/decisions/ADR-template.md` | - |
| 具体决策 | `docs/superpowers/decisions/ADR-{NNN}-{标题}.md` | 任何 Agent |
| 脑暴记录 | `docs/superpowers/specs/{日期}-{主题}-design.md` | Architect |

---

## 二、文档与角色映射

| Agent | 必读文档（通过 design-context skill） | 可写文档 |
|-------|--------------------------------------|---------|
| **PM** | PRD, 系统架构(高层), 验收标准 | Sprint 计划, 风险登记 |
| **PO** | PRD, 用户故事, 验收标准 | PRD, 用户故事, 验收标准 |
| **Architect** | 所有设计文档, ADRs | 架构设计, 数据库设计, API设计, ADR 审查 |
| **UI Designer** | PRD, 系统架构(高层), UI设计规范 | UI设计规范 |
| **Frontend** | 系统架构(高层), API设计, 数据库设计(ER图), UI设计规范, 编码规范 | - |
| **Backend** | 系统架构(详细), API设计, 数据库设计(完整), 编码规范 | - |
| **QA** | 系统架构(高层), 测试计划, 验收标准, 数据库设计(ER图) | 测试报告, 验证记录 |
| **DevOps** | 系统架构(详细), 开发环境搭建, Git工作流 | 部署配置, CHANGELOG |
| **产品体验师** | PRD, 验收标准, UI设计规范, 用户故事 | 体验报告 |

> 所有 Agent 通过 `Skill design-context --role {角色}` 自动获取相关文档摘要

---

## 三、文档生命周期流程

### 创建规则

```
Phase 0: docs/ 目录结构由 init 脚本从模板创建
    ↓
Phase 1: PM/PO/Architect/UI Designer 填充冻结层文档
    ↓
Phase 1 门禁: 验证所有冻结层文档完整且非空
    ↓
Phase 2+: 冻结层锁定，任何修改必须通过 ADR
```

### 冻结规则

1. **冻结时机**: Phase 1→2 门禁通过后立即冻结
2. **冻结标记**: 在文档末尾添加"冻结声明"：
   ```markdown
   **冻结声明**:
   > 本文档在 Phase 1 门禁通过后冻结。任何修改必须通过 ADR 流程。
   ```
3. **冻结验证**: phase-gates.json 包含冻结层文档完整性验证

### ADR 流程

```
1. 任何 Agent 发现设计缺陷
    ↓
2. 创建 ADR-{NNN}-{标题}.md
    ↓
3. Architect Agent 审查 ADR
    ↓
4. 如果接受 → 更新冻结层文档 + 通知相关 Agent
    ↓
5. 如果拒绝 → Agent 使用替代方案
    ↓
6. 如果影响重大 → 暂停相关开发 + 人类审批
```

### 更新规则

| 文档类型 | 更新方式 | 审批要求 |
|---------|---------|---------|
| 冻结层文档 | 只能通过 ADR 更新 | Architect 审批（小型）/ 人类审批（大型） |
| 演化层文档 | Agent 可自行更新 | 无需审批 |
| ADR 文档 | 一旦创建不可删除 | 只能标记为 Superseded |

---

## 四、ADR 粒度判定

### 小型 ADR（Architect 自行审批）

| 类型 | 示例 | 影响范围 |
|------|------|---------|
| 单表字段增减 | 添加用户表的 `phone` 字段 | 单表，不影响其他模块 |
| API 参数调整 | 修改 `/users` 接口的 `name` 字段长度 | 单接口，向后兼容 |
| UI 组件替换 | 替换按钮组件库 | 单组件，不影响页面结构 |

**审批流程**:
1. Architect 审查 ADR
2. 如果接受 → 更新文档 + 通知相关 Agent
3. 如果拒绝 → 返回修改意见

---

### 大型 ADR（需人类审批）

| 类型 | 示例 | 影响范围 |
|------|------|---------|
| 新增/删除模块 | 新增"消息通知"模块 | 多表、多接口、多页面 |
| 数据库表结构变更 | 修改用户-文章关系为多对多 | 核心数据模型变更 |
| API 接口增删 | 删除 `/v1/posts` 接口 | 破坏性变更，影响前端 |
| 技术栈变更 | 从 REST 迁移到 GraphQL | 全局架构变更 |

**审批流程**:
1. Architect 标记为"需人类审批"
2. 暂停相关开发任务
3. 人类审批（通过/拒绝/修改）
4. 如果通过 → 更新文档 + 通知所有相关 Agent
5. 如果拒绝 → Agent 使用替代方案

---

## 五、Phase 门禁验证

### Phase 1→2 门禁条件

```json
{
  "phase1_to_phase2": {
    "conditions": [
      "PRD 文档已完成",
      "系统架构设计文档已完成",
      "数据库设计文档已完成",
      "API 接口设计文档已完成",
      "UI 设计规范文档已完成",
      "Architect 已审查所有设计文档",
      "任务已分配"
    ]
  }
}
```

### 验证脚本

```bash
#!/bin/bash
# 检查冻结层文档完整性

FROZEN_DOCS=(
  "docs/requirements/PRD.md"
  "docs/design/01_系统架构设计.md"
  "docs/design/02_数据库设计.md"
  "docs/design/03_API接口设计.md"
  "docs/design/04_UI设计规范.md"
)

for doc in "${FROZEN_DOCS[@]}"; do
  if [ ! -f "$doc" ]; then
    echo "❌ 缺少冻结层文档: $doc"
    exit 1
  fi

  if [ ! -s "$doc" ]; then
    echo "❌ 冻结层文档为空: $doc"
    exit 1
  fi

  echo "✓ $doc 已存在且非空"
done

echo "✅ 所有冻结层文档验证通过"
```

---

## 六、Agent 读取文档机制

### 三层保障

1. **CLAUDE.md 文档索引** — 每个 session 都会加载
   ```markdown
   ## 文档体系
   - [冻结层文档](docs/requirements/) - Phase 1 产出，修改需 ADR
   - [设计文档](docs/design/) - 系统架构、数据库、API、UI
   - [演化层文档](docs/dev/) - 开发指南、编码规范
   - [文档生命周期规则](rules/06_document_lifecycle.md)
   ```

2. **Agent prompt 内嵌文档引用** — 每个 Agent 启动时明确指定
   ```bash
   Agent --name "Frontend-1" \
     --prompt "...
     📄 必读文档:
     - Read docs/design/03_API接口设计.md - 接口契约
     - Read docs/design/04_UI设计规范.md - UI 组件规范
     - Read docs/dev/02_编码规范.md - 编码标准
     ..."
   ```

3. **design-context skill** — 根据角色自动读取相关文档
   ```bash
   Skill design-context --role frontend
   # 自动读取: API设计、数据库设计(ER图)、UI设计规范、编码规范
   ```

---

## 七、文档模板部署

### init 脚本新增 Step

```bash
# Step 7: 创建文档目录结构
cp -r "$TEMPLATE_DIR/docs/templates/" "$TARGET_DIR/docs/"
```

### 目标项目结构

```
target-project/
├── .claude/           # 模板配置
│   ├── CLAUDE.md
│   ├── rules/
│   ├── skills/
│   └── agents/
├── docs/              # 项目文档
│   ├── requirements/  # 需求文档（Phase 1 填充）
│   ├── design/        # 设计文档（Phase 1 填充）
│   ├── superpowers/   # ADR + 脑暴
│   ├── dev/           # 开发指南
│   ├── test/          # 测试文档
│   ├── fixes/         # 修复记录
│   └── sql/           # SQL 脚本
└── src/               # 项目代码
```

---

*加载顺序: 06*
