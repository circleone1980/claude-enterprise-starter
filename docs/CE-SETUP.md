# CE Plugin 安装与配置指南

> CE (Compound Engineering) 插件为 **必需依赖**，未安装将阻塞阶段推进。

---

## 前置条件

- Node.js >= 18.0.0
- Claude Code CLI >= 1.0.0

## 安装步骤

### 1. 全局安装 CE 插件

```bash
npm install -g @anthropic/ce-plugin
```

### 2. 验证安装

```bash
node scripts/ce-health-check.js
```

预期输出:
```
  PASS .mcp.json exists
  PASS .mcp.json has 5 MCP servers configured
  PASS SSOT declares "ce-brainstorm"
  PASS SSOT declares "ce-plan"
  PASS SSOT declares "ce-work"
  PASS SSOT declares "ce-review"
  PASS SSOT declares "ce-compound"
  PASS No old "ce:" prefix in SSOT
  PASS settings.json has compoundEngineering.skills
  ...
  结果: X PASS, 0 FAIL
```

### 3. CI 环境配置

在 GitHub Actions 中添加安装步骤:

```yaml
- name: Install CE Plugin
  run: npm install -g @anthropic/ce-plugin
```

## 5 个核心技能

| 技能 | 命令 | 用途 | 自动触发 |
|------|------|------|---------|
| 方案脑暴 | `/ce-brainstorm` | 多路径方案探索与收敛 | Phase 1 需求/设计阶段 |
| 经验规划 | `/ce-plan` | 基于历史经验的任务拆分 | Phase 1→2 架构设计后 |
| 核心执行 | `/ce-work` | 单任务迭代 + TDD + 进度追踪 | Phase 2 开发阶段 |
| 多维评审 | `/ce-review` | 6+ 维度独立评审报告 | 每个阶段边界 |
| 知识沉淀 | `/ce-compound` | 经验提取与结构化存储 | 每个阶段转换点 |

## 故障排查

### 健康检查失败

1. **SSOT 声明缺失** — 检查 `automation/agent-orchestration.json` 中 agent 的 `requiredSkills` 是否包含对应 `ce-*` 技能
2. **旧格式残留** — 搜索 `ce:` 前缀并替换为 `ce-`
3. **settings.json 未配置** — 确保 `compoundEngineering.skills` 数组包含全部 5 个技能

### CI 中失败

确保 `.github/workflows/validate.yml` 包含 CE 插件安装步骤。

---

*最后更新: 2026-04-26*
*版本: 3.2.0*
