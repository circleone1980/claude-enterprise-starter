# 项目记忆索引

> 重启 Claude 后，先阅读 `CLAUDE.md` 了解项目规则（含 Agent Team Skills 强制规则）

---

## 🔴 关键文件（必读）

1. **CLAUDE.md** — 包含所有规则 + Agent Team Skills 强制映射（最高优先级）
2. **[Agent Team Skills 映射表](.claude/rules/04_agent_team.md)** — 各角色必用的 Skills/Agents 详细说明
3. **[Architect Skills]**: `writing-plans` 🔴, `react-best-practices` 🔴, `product-requirements`

---

## 项目概览

**项目名称**: [PROJECT_NAME]
**项目描述**: [PROJECT_DESCRIPTION]
**技术栈**: [TECH_STACK]

---

## 当前状态

**阶段**: [CURRENT_PHASE]
**进度**:
- [ ] Phase 1: 需求分析
- [ ] Phase 2: 开发实现
- [ ] Phase 3: 测试验证
- [ ] Phase 4: 产品体验
- [ ] Phase 5: 部署发布

---

## Agent Team 配置

| 角色 | 状态 | 当前任务 |
|------|------|---------|
| PM | ⏳ | - |
| PO | ⏳ | - |
| Architect | ⏳ | - |
| UI Designer | ⏳ | - |
| Frontend | ⏳ | - |
| Backend | ⏳ | - |
| QA | ⏳ | - |
| DevOps | ⏳ | - |
| 产品体验师 | ⏳ | - |

---

## 开发计划

- [开发计划文档](plans/development-plan.md)

---

## 代码审查

- [代码审查记录](code-reviews/)

---

## 文档体系

### 冻结层文档
- **PRD**: `docs/requirements/PRD.md`
- **用户故事**: `docs/requirements/user-stories.md`
- **验收标准**: `docs/requirements/acceptance-criteria.md`
- **系统架构设计**: `docs/design/01_系统架构设计.md`
- **数据库设计**: `docs/design/02_数据库设计.md`
- **API 接口设计**: `docs/design/03_API接口设计.md`
- **UI 设计规范**: `docs/design/04_UI设计规范.md`

### ADR 文档
- **ADR 目录**: `docs/superpowers/decisions/`

**详细规则**: [文档生命周期规则](.claude/rules/06_document_lifecycle.md)

---

## 快速恢复

```bash
1. 读取 CLAUDE.md
2. 读取设计文档摘要: Skill design-context --role {角色}
3. 读取开发计划: plans/development-plan.md
4. 检查冻结层文档: docs/requirements/ 和 docs/design/
5. 检查 Agent 状态: /agents
6. 检查任务状态: /tasks
```

---

*最后更新: [DATE]*

