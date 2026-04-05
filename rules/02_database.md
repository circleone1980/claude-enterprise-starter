# 数据库规范

> 数据库设计和变更规则

---

## 设计规范

- 遵循 SQL 设计范式（第三范式）
- 表名必须为 `t_xxx` 格式
- 可以忽略外键约束（使用应用层约束）
- 主键使用 `id` 或 `xxx_id`

## 字段规范

- 主键: `id` BIGINT AUTO_INCREMENT
- 创建时间: `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- 更新时间: `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- 软删除: `is_deleted` TINYINT DEFAULT 0
- 状态字段: `status` TINYINT

## 索引规范

- 主键自动创建索引
- 外键列必须创建索引
- 查询条件列创建索引
- 联合索引遵循最左前缀原则

## 变更规范

- 统一使用 Python 脚本插入数据
- 脚本统一放在 `docx/sql/` 文件夹下
- 迁移脚本必须可回滚

---

*加载顺序: 02*
*适用范围: backend/models/**, backend/schemas/**, docx/sql/***
