# 数据库规范

> 数据库设计和变更规则

---

## 变更管理

- 统一使用 Python 脚本插入
- 脚本放在 `docs/sql/` 目录下
- 版本可控、可审计、可回滚

## 设计规范

- 遵循数据库设计范式
- 使用 Prisma ORM 进行数据库操作
- 参考 `skills/prisma-database-setup/`

---

*加载顺序: 02*
