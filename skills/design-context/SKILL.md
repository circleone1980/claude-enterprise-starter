---
name: design-context
description: |
  Load design context for a role. Reads design docs and returns constraint summary.
  TRIGGER when: agent starts, before dev tasks, user mentions "设计文档", "约束", "规范".
  Supports roles: pm, po, frontend, backend, qa, devops, architect, ui-designer, product-experience.
user-invocable: false
disable-model-invocation: true
allowed-tools: Read Grep Glob
effort: low
---

# 设计上下文技能

根据角色自动读取相关设计文档，提取关键约束点，帮助 Agent 快速了解项目设计要求。

---

## 何时使用

**自动触发场景**:
- Agent 启动时（通过 Agent prompt 内嵌指令）
- 开发任务开始前
- 用户提到"设计文档"、"约束"、"规范"、"需求"等关键词

**手动调用**:
```bash
Skill design-context --role {角色}
```

---

## 使用方式

### 参数

```bash
Skill design-context --role <角色>
```

**支持的角色**:
- `pm` - 产品经理
- `po` - 产品负责人
- `architect` - 架构师
- `ui-designer` - UI 设计师
- `frontend` - 前端开发
- `backend` - 后端开发
- `qa` - 测试工程师
- `devops` - DevOps 工程师
- `product-experience` - 产品体验师

---

## 角色与文档映射

| 角色 | 必读文档 | 文档路径 |
|------|---------|---------|
| **PM** | PRD, 系统架构(高层), 验收标准 | `docs/requirements/PRD.md`, `docs/design/01_系统架构设计.md`, `docs/requirements/acceptance-criteria.md` |
| **PO** | PRD, 用户故事, 验收标准 | `docs/requirements/PRD.md`, `docs/requirements/user-stories.md`, `docs/requirements/acceptance-criteria.md` |
| **Architect** | 所有设计文档, ADRs | `docs/design/` 所有文件, `docs/superpowers/decisions/` 所有 ADR |
| **UI Designer** | PRD, 系统架构(高层), UI设计规范 | `docs/requirements/PRD.md`, `docs/design/01_系统架构设计.md`, `docs/design/04_UI设计规范.md` |
| **Frontend** | 系统架构(高层), API设计, 数据库设计(ER图), UI设计规范, 编码规范 | `docs/design/01_系统架构设计.md`, `docs/design/03_API接口设计.md`, `docs/design/02_数据库设计.md`, `docs/design/04_UI设计规范.md`, `docs/dev/02_编码规范.md` |
| **Backend** | 系统架构(详细), API设计, 数据库设计(完整), 编码规范 | `docs/design/01_系统架构设计.md`, `docs/design/03_API接口设计.md`, `docs/design/02_数据库设计.md`, `docs/dev/02_编码规范.md` |
| **QA** | 系统架构(高层), 测试计划, 验收标准, 数据库设计(ER图) | `docs/design/01_系统架构设计.md`, `docs/test/01_测试计划.md`, `docs/requirements/acceptance-criteria.md`, `docs/design/02_数据库设计.md` |
| **DevOps** | 系统架构(详细), 开发环境搭建, Git工作流 | `docs/design/01_系统架构设计.md`, `docs/dev/01_开发环境搭建.md`, `docs/dev/03_Git工作流.md` |
| **产品体验师** | PRD, 验收标准, UI设计规范, 用户故事 | `docs/requirements/PRD.md`, `docs/requirements/acceptance-criteria.md`, `docs/design/04_UI设计规范.md`, `docs/requirements/user-stories.md` |

---

## 执行流程

### Step 1: 解析角色参数

根据 `--role` 参数确定需要读取的文档列表。

**错误处理**:
- 如果 `--role` 参数缺失或无效，返回错误：
  ```
  ❌ 错误: 缺少或无效的角色参数

  用法: Skill design-context --role <角色>

  支持的角色:
  - pm, po, architect, ui-designer
  - frontend, backend, qa, devops
  - product-experience
  ```

---

### Step 2: 读取文档

按照角色映射表读取对应文档。

**读取顺序**:
1. 需求文档（`docs/requirements/`）
2. 设计文档（`docs/design/`）
3. 开发文档（`docs/dev/`）
4. 测试文档（`docs/test/`）
5. ADR 文档（`docs/superpowers/decisions/`，仅 Architect）

**错误处理**:
- 如果某个文档不存在，**立即停止并返回明确的错误信息**：
  ```
  ❌ 错误: 缺少必要的设计文档

  角色: Frontend
  缺少文档: docs/design/03_API接口设计.md

  解决方案:
  1. 创建缺失的文档: docs/design/03_API接口设计.md
  2. 或者联系 PM/Architect 完成文档创建
  ```

---

### Step 3: 提取关键约束点

对每个文档提取关键约束点，**不要返回完整文档内容**。

**提取原则**:
- 只提取对当前角色有实际约束意义的内容
- 使用 Markdown 列表格式
- 每个约束点控制在 1-2 行
- 忽略填充性内容（如"TODO"、"待补充"等）

**约束类型**:
- **数据约束**: 字段长度、数据类型、必填项
- **API 约束**: 端点路径、请求方法、参数要求
- **UI 约束**: 颜色值、字体大小、间距
- **业务约束**: 验收标准、业务规则
- **技术约束**: 技术栈、框架版本、性能要求

---

### Step 4: 生成摘要输出

按照以下格式输出摘要：

```markdown
# 设计上下文摘要 - {角色名称}

> **生成时间**: {YYYY-MM-DD HH:mm}
> **文档状态**: ✅ 所有文档已读取

---

## 📋 需求约束

### 产品需求文档 (PRD)
- **核心功能**: [列举核心功能]
- **非功能需求**: [列举性能、安全、可用性要求]
- **技术约束**: [技术栈、集成约束]

---

## 🏗️ 架构约束

### 系统架构设计
- **架构模式**: [如微服务/单体]
- **技术栈**: [前端/后端/数据库]
- **关键组件**: [列举核心组件]
- **数据流**: [关键数据流描述]

---

## 🔌 API 约束

### API 接口设计
- **认证方式**: [如 JWT]
- **Base URL**: [API 地址]
- **核心端点**:
  - `GET /users` - 获取用户列表
  - `POST /auth/login` - 用户登录

---

## 🗄️ 数据库约束

### 数据库设计
- **数据库类型**: [如 PostgreSQL]
- **核心实体**: [列举主要表]
- **关键字段**:
  - `users.email` - VARCHAR(255), UNIQUE, NOT NULL
  - `posts.title` - VARCHAR(200), NOT NULL

---

## 🎨 UI 约束

### UI 设计规范
- **主色调**: Primary #3B82F6
- **字体**: Inter (标题), Inter (正文)
- **按钮高度**: 40px (md)
- **圆角**: 8px

---

## 📝 编码约束

### 编码规范
- **命名规范**: 组件 PascalCase, 变量 camelCase
- **DRY 原则**: 避免重复代码
- **注释要求**: 复杂逻辑必须注释

---

## ✅ 验收标准

### 验收标准
- **AC-1.1**: [验收标准描述]
- **AC-1.2**: [验收标准描述]

---

*文档完整性: 5/5 个文档已读取*
*总约束点: 23 个*
```

---

## 示例输出

### 示例 1: Frontend 角色

```markdown
# 设计上下文摘要 - Frontend

> **生成时间**: 2026-04-08 14:30
> **文档状态**: ✅ 所有文档已读取

---

## 🏗️ 架构约束

### 系统架构设计
- **架构模式**: 前后端分离
- **前端技术栈**: React + TypeScript + Tailwind CSS
- **状态管理**: Zustand
- **组件库**: shadcn/ui

---

## 🔌 API 约束

### API 接口设计
- **认证方式**: JWT Bearer Token
- **Base URL**: `https://api.example.com/v1`
- **核心端点**:
  - `POST /auth/login` - 用户登录
  - `GET /users/me` - 获取当前用户
  - `GET /posts?page=1&limit=10` - 获取文章列表

---

## 🗄️ 数据库约束

### 数据库设计 (ER 图)
- **核心实体**: User, Post, Comment
- **关键字段**:
  - `users.id` - UUID, PRIMARY KEY
  - `users.email` - VARCHAR(255), UNIQUE, NOT NULL
  - `posts.title` - VARCHAR(200), NOT NULL
  - `posts.status` - ENUM(draft, published, archived)

---

## 🎨 UI 约束

### UI 设计规范
- **主色调**: Primary #3B82F6
- **字体**: Inter 16px (正文)
- **按钮**: 高度 40px, padding 12px 24px
- **输入框**: 高度 40px
- **卡片**: 圆角 8px, shadow-sm

---

## 📝 编码约束

### 编码规范
- **组件命名**: PascalCase (如 `UserProfile.tsx`)
- **文件命名**: kebab-case (如 `user-profile.tsx`)
- **变量命名**: camelCase (如 `userName`)
- **代码覆盖率**: > 80%

---

*文档完整性: 5/5 个文档已读取*
*总约束点: 18 个*
```

---

## 边界情况处理

### 1. 文档不存在

```markdown
❌ 错误: 缺少必要的设计文档

角色: Frontend
缺少文档: docs/design/03_API接口设计.md

解决方案:
1. 创建缺失的文档: docs/design/03_API接口设计.md
2. 或者联系 PM/Architect 完成文档创建

当前已读取的文档:
- ✅ docs/design/01_系统架构设计.md
- ✅ docs/design/02_数据库设计.md
- ❌ docs/design/03_API接口设计.md (不存在)
- ✅ docs/design/04_UI设计规范.md
- ✅ docs/dev/02_编码规范.md
```

### 2. 角色参数缺失

```markdown
❌ 错误: 缺少角色参数

用法: Skill design-context --role <角色>

支持的角色:
- pm, po, architect, ui-designer
- frontend, backend, qa, devops
- product-experience

示例:
Skill design-context --role frontend
```

### 3. 文档为空或内容不足

```markdown
⚠️ 警告: 文档内容不足

文档: docs/design/03_API接口设计.md
问题: 文档存在但缺少关键内容

建议: 联系 Architect 补充 API 接口设计细节
```

---

## 性能优化

- **缓存机制**: 如果文档未修改，使用缓存摘要（可选）
- **并行读取**: 同时读取多个文档（如果工具支持）
- **摘要长度**: 控制总输出在 2000 字以内，避免 prompt 过长

---

## 注意事项

1. **不要返回完整文档**: 只提取关键约束点，避免 prompt 长度爆炸
2. **保持结构化**: 使用 Markdown 列表和标题，便于 Agent 快速定位
3. **明确约束类型**: 区分数据约束、API 约束、UI 约束等
4. **错误即停止**: 遇到文档缺失立即停止，不要继续执行
5. **友好错误提示**: 提供明确的解决方案，帮助用户快速修复

---

*技能版本: 1.0*
*最后更新: 2026-04-08*
