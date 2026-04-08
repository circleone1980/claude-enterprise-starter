# 验收标准

> **项目名称**: [项目名称]
> **版本**: v1.0.0
> **创建日期**: {YYYY-MM-DD}
> **负责人**: PO + PM
> **状态**: [草稿/评审中/已批准]

---

## 概述

验收标准定义了产品功能必须满足的客观条件，用于判断功能是否完成。遵循 Given-When-Then 格式（Gherkin 语法）。

---

## 验收标准编写原则

### SMART 原则
- **S**pecific（具体的）: 清晰描述预期行为
- **M**easurable（可测量的）: 可以通过测试验证
- **A**chievable（可实现的）: 技术上可行
- **R**elevant（相关的）: 与业务目标对齐
- **T**ime-bound（有时限的）: 在指定时间内可完成

---

## 功能验收标准

### 功能 1: [功能名称]

#### AC 1.1: [验收标准标题]
**优先级**: [P0/P1/P2]

**Given-When-Then**:
```gherkin
Feature: [功能名称]

  Scenario: [场景名称]
    Given [前置条件]
      And [附加条件]
    When [用户操作]
      And [附加操作]
    Then [预期结果]
      And [附加验证]
```

**测试数据**:
- 输入: [具体测试数据]
- 预期输出: [预期结果]

**边界条件**:
- 最小值: [如 min_length = 1]
- 最大值: [如 max_length = 100]
- 空值处理: [如何处理 null/undefined]
- 非法输入: [如何验证和拒绝]

---

#### AC 1.2: [验收标准标题]
<!-- 按相同格式继续 -->

---

### 功能 2: [功能名称]
<!-- 按相同格式继续 -->

---

## 非功能验收标准

### 性能验收标准

#### AC-NF-1: 响应时间
```gherkin
Feature: 系统性能

  Scenario: API 响应时间达标
    Given 系统正常运行
    When 用户发起 API 请求
    Then 95% 的请求响应时间 < 200ms
      And 99% 的请求响应时间 < 500ms
```

#### AC-NF-2: 并发处理
```gherkin
  Scenario: 并发用户支持
    Given 1000 个并发用户
    When 同时发起请求
    Then 系统响应正常
      And 无数据丢失
```

---

### 安全验收标准

#### AC-NF-3: 认证与授权
```gherkin
Feature: 系统安全

  Scenario: 未授权访问拒绝
    Given 用户未登录
    When 访问受保护资源
    Then 返回 401 Unauthorized
      And 不返回敏感数据
```

#### AC-NF-4: 数据加密
```gherkin
  Scenario: 敏感数据加密存储
    Given 用户提交敏感数据
    When 数据写入数据库
    Then 数据已加密存储
      And 日志中无明文敏感数据
```

---

### 可用性验收标准

#### AC-NF-5: 系统可用性
```gherkin
Feature: 系统可用性

  Scenario: 系统高可用
    Given 系统正常运行
    When 监控系统检测可用性
    Then 月度可用性 >= 99.9%
      And 单次故障恢复时间 < 5 分钟
```

---

## UI/UX 验收标准

### AC-UI-1: 响应式设计
```gherkin
Feature: 响应式设计

  Scenario: 移动端适配
    Given 用户使用移动设备访问
    When 屏幕宽度 < 768px
    Then 页面布局自适应
      And 所有功能可用
      And 无横向滚动条
```

### AC-UI-2: 无障碍访问
```gherkin
  Scenario: 屏幕阅读器支持
    Given 用户使用屏幕阅读器
    When 访问页面
    Then 所有元素有正确的 aria 标签
      And 键盘导航完整
```

---

## 数据验证标准

### AC-DATA-1: 数据完整性
```gherkin
Feature: 数据完整性

  Scenario: 必填字段验证
    Given 用户提交表单
    When 必填字段为空
    Then 显示验证错误
      And 阻止表单提交
```

### AC-DATA-2: 数据格式验证
```gherkin
  Scenario: 邮箱格式验证
    Given 用户输入邮箱地址
    When 格式不符合规范
    Then 显示格式错误提示
      And 不提交数据
```

---

## 业务流程验收标准

### AC-BIZ-1: 端到端流程
```gherkin
Feature: [业务流程名称]

  Scenario: 完整业务流程
    Given [初始状态]
    When [步骤 1]
      And [步骤 2]
      And [步骤 3]
    Then [最终状态]
      And [验证点 1]
      And [验证点 2]
```

---

## 验收测试矩阵

| 功能 | 验收标准 ID | 测试类型 | 自动化 | 负责人 |
|------|------------|---------|--------|--------|
| [功能名] | AC-1.1 | 单元测试 | ✅ | Backend |
| [功能名] | AC-1.2 | 集成测试 | ✅ | Backend |
| [功能名] | AC-1.3 | E2E 测试 | ✅ | QA |
| [性能] | AC-NF-1 | 性能测试 | ✅ | QA |

---

**冻结声明**:
> 本文档在 Phase 1 门禁通过后冻结。任何修改必须通过 ADR 流程。

---

*模板版本: 1.0*
*最后更新: 2026-04-08*
