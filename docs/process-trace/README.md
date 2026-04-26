# 过程追踪系统

> 确保每个产出物记录完整的过程信息，实现全程可追溯

---

## 一、目的

过程追踪系统解决框架执行强制力不足的问题：

- **问题**: 框架定义了 17 个 Agent、38 个 Skill、17 条 Rule，但没有机制验证它们是否被使用
- **方案**: 每个产出物必须记录使用了哪些 Agent、Skill、Rule，缺失过程记录的门禁不通过

---

## 二、目录结构

```
docs/process-trace/
├── README.md                    # 本文件
├── templates/
│   └── trace-entry.md           # 过程记录模板
├── phase1/                      # Phase 1 过程记录
│   ├── 001-prd-generation.md
│   ├── 002-user-stories-generation.md
│   ├── 003-acceptance-criteria.md
│   ├── 004-architecture-design.md
│   ├── 005-data-storage-design.md
│   ├── 006-api-design.md
│   ├── 007-ui-spec.md
│   └── 008-adversarial-review.md
├── phase2/                      # Phase 2 过程记录
└── ...                          # 后续 Phase
```

---

## 三、使用流程

### 3.1 产出文档前

1. 确定使用哪个 Agent、哪些 Skill、哪些 Rule
2. 创建过程追踪文件（从模板复制）
3. 按步骤执行，记录每步过程

### 3.2 产出文档后

1. 补充过程追踪中的产出物路径
2. 记录关键决策
3. 如有审查，记录审查结果

### 3.3 门禁检查

`hooks/scripts/process-trace-check.js` 自动验证：
1. 对应过程记录文件是否存在
2. 必填项是否完整
3. requiredSkills 是否被记录
4. requiredAgent 是否匹配

---

## 四、过程记录必填项

| 字段 | 说明 | 示例 |
|------|------|------|
| phase | 阶段号 | `1` |
| artifact | 产出物路径 | `docs/requirements/PRD.md` |
| agent | 使用的 Agent | `pm` |
| agentFile | Agent 定义文件 | `agents/pm.md` |
| timestamp | 时间戳 | `2026-04-26T14:30:00` |
| status | 状态 | `completed` |

---

## 五、质量指标计算

| 指标 | 公式 | 达标线 |
|------|------|--------|
| Skill 调用完整度 | 已调用 / 应调用 | ≥ 80% |
| Agent 合规度 | 是否使用框架 Agent | 100% |
| Rule 遵循度 | 是否遵循强制规则 | 100% |
| 审查覆盖率 | 已审查 / 应审查 | ≥ 80% |

---

*版本: 1.0.0*
*最后更新: 2026-04-26*
