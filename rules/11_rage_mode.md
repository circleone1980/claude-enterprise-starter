# 狂暴模式（Rage Mode）

> **全自动开发模式**: Claude Code 全权接管开发任务，无需人为介入确认各阶段推进

## 自动化能力

| 自动化功能                  | 触发条件               |
| --------------------------- | ---------------------- |
| **自动创建 GitHub 仓库** | 项目初始化时           |
| **定时推送代码**       | 每 30 分钟 / 每阶段完成 |
| **Agent 健康监控**    | 每 5 分钟检查          |
| **自动重启下线 Agent** | 检测到 Agent 下线      |
| **阶段自动推进**        | 前置阶段完成且通过验证 |
| **安全边界守护**        | 每次工具调用前         |

## 阶段自动推进流程

```
Phase 0: 项目初始化
    ↓ (自动, IF gstack.enabled)
Phase 0.5: 产品设计 (Product-Designer → Design-Reviewer)
    ↓ (自动, gstack-bridge 转换输出)
Phase 1: 需求分析 (PM/PO/Architect 并行)
    ↓ (自动验证通过后)
Phase 2: 开发实现 (Frontend x3 / Backend-Java x2 / Backend-Python x1 / UI Designer 并行)
    ↓ (自动验证通过后)
Phase 3: 测试验证 (QA + 代码审查)
    ↓ (自动验证通过后)
Phase 4: 产品体验 (产品体验师)
    ↓ (自动验证通过后)
Phase 5: 部署发布 (DevOps)
    ↓ (自动)
GitHub 推送 → 完成报告
```

## 安全边界

**需要用户确认的操作:**

- 删除/编辑项目目录外的任何文件
- 执行 sudo 命令
- 访问 `~/.ssh`, `~/.gnupg`, `~/.config` 等敏感路径

*加载顺序: 11*
