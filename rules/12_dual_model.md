# 双模型协作策略

## 模型分工

| 场景               | 使用工具                        | 模型    | 原因                 |
| ------------------ | ------------------------------- | ------- | -------------------- |
| **代码开发** | Claude Code（GLM-5）            | GLM-5   | 开发任务，主会话模型 |
| **代码审查** | `/codex:review`               | GPT-5.4 | 编码能力强，独立视角 |
| **对抗审查** | `/codex:adversarial-review`    | GPT-5.4 | 主动挑错，提升质量   |
| **Bug 修复** | `/codex:rescue`               | GPT-5.4 | 诊断+修复一步到位    |
| **后台审查** | Stop Hook（Codex Review Gate）  | GPT-5.4 | 每次会话结束自动审查 |

## 使用时机

**Phase 0.5（GStack 产品设计）**:

- 产品构思 → GLM-5
- 架构审查 → `/codex:review`

**Phase 1（需求分析）**:

- 文档编写 → GLM-5
- 架构审查 → `/codex:review`

**Phase 2（开发）**:

- 开发代码 → GLM-5
- 完成 Feature 后 → `/codex:review`
- 发现 Bug → `/codex:rescue`

**Phase 3（测试）**:

- QA 验证 → GLM-5
- 代码审查 → `/codex:review`

**Phase 5（部署前）**:

- 最终审查 → `/codex:adversarial-review`

## 启用 Stop Review Gate（L3 兜底层）

**首次使用必须执行**:
```bash
/codex:setup --enable-review-gate
```

启用后，每次会话结束自动运行 Codex 审查。Stop Gate 内置智能判断：
- **有代码变更** → 自动触发 Codex 审查（GPT-5.4）
- **纯文档/报告/状态输出** → 自动跳过，不触发
- **Codex 未安装** → 静默跳过，不阻塞

## Codex 自动触发时机总结

| 触发层 | 时机             | 方法                           | 可跳过？ |
| ------ | ---------------- | ------------------------------ | -------- |
| L1 自动 | Phase 2→3 门禁   | orchestrate.sh 调用 `codex review` | 否       |
| L1 自动 | Phase 4→5 门禁   | orchestrate.sh 调用 `codex adversarial-review` | 否       |
| L2 提醒 | Agent 任务完成   | prompt 注入提醒主 Claude       | 是       |
| L3 兜底 | 会话结束有代码变更 | Stop Review Gate（需首次 setup） | 否       |
| L4 手动 | 随时             | `/codex:review` / `/codex:rescue` | 是       |

*加载顺序: 12*
