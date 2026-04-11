# 代码注释规范

> 所有生成代码的中文注释和版本控制标准

---

## 一、适用范围

- **适用**: `.ts`, `.tsx`, `.js`, `.jsx`, `.java`, `.py` 源文件
- **豁免**: 配置文件（`.json`, `.yaml`, `.xml`）、测试 `describe` 块、纯类型声明文件、枚举/常量定义文件

---

## 二、模块头注释（强制）

每个源文件顶部必须有模块头注释，包含以下字段：

### TypeScript / JavaScript

```typescript
/**
 * @module services/auth
 * @version 1.0.0
 * @since 2026-04-11
 * @description 用户认证服务，处理登录/登出/Token 刷新
 *
 * Changelog:
 * - 1.0.0 (2026-04-11): 初始实现 — 登录/登出/Token 刷新
 */
```

### Java

```java
/**
 * @module services/auth
 * @version 1.0.0
 * @since 2026-04-11
 * @description 用户认证服务，处理登录/登出/Token 刷新
 *
 * Changelog:
 * - 1.0.0 (2026-04-11): 初始实现 — 登录/登出/Token 刷新
 */
```

### Python

```python
"""
@module: services/auth
@version: 1.0.0
@since: 2026-04-11
@description: 用户认证服务，处理登录/登出/Token 刷新

Changelog:
- 1.0.0 (2026-04-11): 初始实现 — 登录/登出/Token 刷新
"""
```

### 字段说明

| 字段 | 必填 | 格式 | 说明 |
|------|------|------|------|
| `@module` | 是 | `路径/模块名` | 模块在项目中的逻辑路径 |
| `@version` | 是 | `MAJOR.MINOR.PATCH` | 当前文件版本（语义化版本） |
| `@since` | 是 | `YYYY-MM-DD` | 文件创建日期 |
| `@description` | 是 | 中文 | 模块功能简述（一句话） |
| `Changelog` | 是 | 见下方格式 | 版本变更记录 |

---

## 三、函数注释（强制）

每个**公开函数**必须有中文注释。私有函数仅在有复杂逻辑时注释。

### TypeScript / JavaScript (JSDoc)

```typescript
/**
 * 用户登录
 *
 * @param {LoginRequest} req - 登录请求参数
 * @returns {Promise<AuthResult>} 认证结果，包含 Token 和用户信息
 * @throws {AuthError} 当凭证无效或账户被锁定时抛出
 */
async function login(req: LoginRequest): Promise<AuthResult> {
```

### Java (Javadoc)

```java
/**
 * 用户登录
 *
 * @param req 登录请求参数
 * @return 认证结果，包含 Token 和用户信息
 * @throws AuthException 当凭证无效或账户被锁定时抛出
 */
public AuthResult login(LoginRequest req) {
```

### Python (docstring)

```python
def login(self, req: LoginRequest) -> AuthResult:
    """
    用户登录

    Args:
        req: 登录请求参数

    Returns:
        AuthResult: 认证结果，包含 Token 和用户信息

    Raises:
        AuthError: 当凭证无效或账户被锁定时抛出
    """
```

### 注释要素

| 要素 | 必填 | 说明 |
|------|------|------|
| 功能描述 | 是 | 一句话中文说明函数用途 |
| `@param` | 有参数时 | 每个参数一行，含类型和中文说明 |
| `@returns` / `@return` | 有返回值时 | 含类型和中文说明 |
| `@throws` / `@raises` | 有异常时 | 含异常类型和触发条件 |

---

## 四、版本编号规则

遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/):

- **MAJOR**: 不兼容的 API 变更（如删除接口、修改返回类型）
- **MINOR**: 向下兼容的功能新增（如新增参数但有默认值）
- **PATCH**: 向下兼容的问题修复（如 Bug 修复、性能优化）

---

## 五、Changelog 格式

```
Changelog:
- 1.2.0 (2026-04-15): 新增 Token 刷新功能
- 1.1.1 (2026-04-13): 修复并发登录竞态条件
- 1.1.0 (2026-04-12): 新增登出接口
- 1.0.0 (2026-04-11): 初始实现 — 登录/登出
```

**规则**:
- 最新版本在最上面
- 每行格式: `- 版本号 (日期): 简要说明`
- 说明用中文
- 日期用 `YYYY-MM-DD` 格式

---

## 六、违规处理

在 code-review 中按以下严重性处理：

| 违规 | 严重性 | 处理 |
|------|--------|------|
| 缺少模块头 | 🟡 Major | 合并前必须补全 |
| 模块头缺少必填字段 | 🟡 Major | 合并前必须补全 |
| 公开函数缺少注释 | 🟡 Major | 合并前必须补全 |
| 函数注释缺少参数说明 | 🟢 Minor | 建议补全 |
| Changelog 未更新 | 🟢 Minor | 建议补全 |

---

## 七、注释模板

项目提供了三种语言的注释模板文件，位于 `templates/code-headers/`:

| 文件 | 语言 |
|------|------|
| `typescript.ts.template` | TypeScript / JavaScript |
| `java.java.template` | Java |
| `python.py.template` | Python |

使用方式：复制对应模板到新文件开头，替换占位内容。

---

*加载顺序: 08*
*版本: 1.0.0*
*最后更新: 2026-04-11*
