# 入口管理规则

> 借鉴 superpowers 的 using-superpowers 机制，确保 LLM 在每个阶段正确使用框架组件

---

## 设计原理

框架有 18 条规则、17 个 Agent、37+ 个 Skill，但 LLM 容易绕过。根本原因：
1. 无 SessionStart 注入 — LLM 启动时不知道流程
2. 门禁是 PostToolUse — 操作后才检查，违规已发生
3. 标记文件自建自检 — LLM 自己创建标记文件自己检查

解决方案：三层架构 + Hook 强制层。

---

## 三层架构

```
L0: PreToolUse Hook 强制层
 ├── phase-gate-guard.js — 阶段门禁前置拦截
 └── 标记文件由 Hook 自动创建

L1: SessionStart Hook 注入
 └── hooks/scripts/session-start → 注入 using-ce-framework

L2: using-ce-framework 元技能
 ├── Iron Laws（铁律）
 ├── Red Flags（红旗表）
 ├── 阶段流程决策图
 └── Hard Gates（硬门槛）

L3: 具体 Skills 按需加载
 └── 37+ 个 Skills 通过 Skill 工具调用
```

---

## SessionStart 注入机制

每次会话启动、clear、compact 时：
1. `hooks/hooks.json` 的 SessionStart 段触发
2. `hooks/scripts/run-hook.cmd` 跨平台执行 `hooks/scripts/session-start`
3. `session-start` 读取 `skills/using-ce-framework/SKILL.md`
4. 读取 `.claude/logs/current-phase.json` 获取当前阶段
5. 将完整元技能内容注入到 `<EXTREMELY_IMPORTANT>` 标签中
6. LLM 从第一条回复就知道框架的存在和使用规则

---

## PreToolUse 门禁机制

### phase-gate-guard.js

在 Edit/Write 操作**之前**检查当前阶段是否允许操作目标文件：

| 阶段 | 允许的操作路径 |
|------|--------------|
| Phase 0 | `docs/brainstorms/`, `.claude/` |
| Phase 1 | `docs/requirements/`, `docs/design/`, `docs/reviews/` |
| Phase 2+ | `src/` 及所有目录 |

**白名单豁免**（不受阶段约束）:
- `rules/`, `automation/`, `scripts/`, `.claude/`, `hooks/`, `skills/`
- `CLAUDE.md`, `README.md`, `settings.json`, `package.json`
- `templates/`, `test/`, `teams/`

**临时跳过**: 设置环境变量 `CE_SKIP_GATE=1`

### 标记文件自动化

标记文件（`.phase2-code-complete` 等）由 `phase-controller.js` 在门禁全部通过时自动创建，存放在 `.claude/logs/` 目录。LLM 不能自行创建标记文件。

---

## Iron Laws（铁律）

| # | 铁律 | 说明 |
|---|------|------|
| 1 | TDD | 没有失败测试在前，不写生产代码 |
| 2 | 验证 | 没有运行验证命令，不宣称完成 |
| 3 | 调试 | 没有根因分析，不提出修复方案 |
| 4 | Review | 没有经过 code-review，不标记 Feature 完成 |
| 5 | 阶段 | 没有通过当前阶段门禁，不进入下一阶段 |
| 6 | 追踪 | 没有过程记录，产出物等于不存在 |

---

## 与 Superpowers 插件共存

- CE 框架管理项目级工作流（阶段、Agent、门禁）
- Superpowers 管理开发实践（TDD、调试、review）
- 两者互补，不冲突
- CE 框架的 Hard Gates 和阶段流程优先

---

*加载顺序: 18*
