# 代码注释模板

## 使用方法

1. 复制对应语言的模板到新文件开头
2. 替换 `{占位符}` 为实际内容
3. 保留 `@module`, `@version`, `@since`, `@description`, `Changelog` 字段

## 可用模板

| 文件 | 语言 | 注释风格 |
|------|------|---------|
| `typescript.ts.template` | TypeScript / JavaScript | JSDoc |
| `java.java.template` | Java | Javadoc |
| `python.py.template` | Python | docstring |

## 版本更新

修改文件时，更新模块头中的:
- `@version` — 递进版本号
- `Changelog` — 在最上方添加新行

详细规范见 `rules/08_code_comments.md`
