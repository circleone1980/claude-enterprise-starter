# 安全规范

> 安全边界和敏感数据处理规则

---

## 🔴 强制安全边界

**禁止操作（需用户确认）:**
- 删除项目目录外的任何文件
- 编辑项目目录外的任何文件
- 执行 `sudo` 命令
- 执行 `rm -rf` 命令
- 访问敏感路径：
  - `~/.ssh`
  - `~/.gnupg`
  - `~/.config`
  - `/etc`
  - `/System`

**安全白名单（自动允许）:**
- 项目目录内的所有操作
- git 操作（push, pull, commit）
- npm/pip 等包管理操作
- 测试运行

---

## 敏感数据处理

### 禁止硬编码
- ❌ API Keys
- ❌ 数据库密码
- ❌ JWT 密钥
- ❌ 加密密钥
- ❌ 用户凭证

### 使用环境变量
```bash
# .env 文件（gitignored）
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

### 配置文件安全
- 敏感配置使用环境变量
- `.env` 文件加入 `.gitignore`
- 生产环境使用加密存储

---

## 代码安全

### 输入验证
- 所有用户输入必须验证
- 防止 SQL 注入（使用参数化查询）
- 防止 XSS 攻击（转义输出）
- 防止 CSRF 攻击（使用 Token）

### 认证授权
- JWT Token 有效期设置
- 敏感操作二次验证
- 权限最小化原则

---

*加载顺序: 05*
*适用范围: 全局*
