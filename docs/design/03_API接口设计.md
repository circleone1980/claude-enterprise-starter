# API 接口设计

> **项目名称**: [项目名称]
> **版本**: v1.0.0
> **Base URL**: `https://api.example.com/v1`
> **负责人**: Architect
> **状态**: [草稿/评审中/已批准]

---

## 一、API 设计原则

### 1.1 RESTful 规范
- 使用名词复数形式（如 `/users`, `/posts`）
- 使用 HTTP 方法表达操作（GET, POST, PUT, DELETE）
- 使用 HTTP 状态码表达结果（200, 201, 400, 401, 404, 500）
- 版本控制通过 URL Path（`/v1/`, `/v2/`）

### 1.2 统一响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { },
  "message": "操作成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "邮箱格式不正确",
    "details": [ ]
  }
}
```

---

## 二、认证接口

### 2.1 用户注册

**POST** `/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "张三"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "张三"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**错误码**:
- `EMAIL_EXISTS` - 邮箱已注册
- `VALIDATION_ERROR` - 输入验证失败

---

### 2.2 用户登录

**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "张三"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**错误码**:
- `INVALID_CREDENTIALS` - 邮箱或密码错误
- `ACCOUNT_INACTIVE` - 账号已被禁用

---

## 三、用户接口

### 3.1 获取当前用户

**GET** `/users/me`

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三",
    "avatarUrl": "https://...",
    "createdAt": "2026-04-08T10:00:00Z"
  }
}
```

---

## 四、文章接口

### 4.1 获取文章列表

**GET** `/posts?page=1&limit=10&status=published`

**Query Parameters**:
- `page` (optional): 页码，默认 1
- `limit` (optional): 每页数量，默认 10
- `status` (optional): 状态过滤（draft, published, archived）

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "文章标题",
        "summary": "文章摘要",
        "viewCount": 100,
        "publishedAt": "2026-04-08T10:00:00Z",
        "author": {
          "id": "uuid",
          "name": "张三"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

## 五、错误码表

| 错误码 | HTTP 状态码 | 说明 |
|--------|-----------|------|
| `VALIDATION_ERROR` | 400 | 输入验证失败 |
| `UNAUTHORIZED` | 401 | 未认证 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

*模板版本: 1.0*
*最后更新: 2026-04-08*
