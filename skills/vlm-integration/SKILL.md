---
name: vlm-integration
description: |
  VLM 视觉语言模型集成 — 图像理解、多模态处理、OCR、图像描述、视觉问答。
  TRIGGER when: 集成图像识别、视觉AI、多模态功能。
paths: "**/vlm/**,**/vision/**,**/multimodal/**"
effort: high
---

# VLM 视觉语言模型集成

多模态 AI 集成的生产级模式。

## 触发场景

- 图像理解和描述生成
- OCR（光学字符识别）
- 视觉问答（Visual QA）
- 图像对比和分析
- 文档解析（扫描件、PDF）
- 多模态 RAG

## 技术选型

| 场景 | Java 方案 | Python 方案 |
|------|-----------|-------------|
| GPT-4V / GPT-4o | `openai-java` | `openai` SDK |
| Claude Vision | `anthropic-java` | `anthropic` SDK |
| 本地 VLM | Ollama (llava) | `transformers` + PIL |
| OCR | Tesseract + Java | `pytesseract` / `surya` |
| PDF 解析 | Apache PDFBox | `pymupdf` / `marker` |
| 图像预处理 | `thumbnailator` | `Pillow` / `opencv-python` |

## 图像处理管道

```python
# Python: 图像预处理 + VLM 调用
import base64
from pathlib import Path

class VlmService:
    def __init__(self, max_image_size: int = 20 * 1024 * 1024):
        self.max_size = max_image_size

    def encode_image(self, image_path: str) -> str:
        """编码图像为 base64，自动调整大小"""
        path = Path(image_path)
        if path.stat().st_size > self.max_size:
            # 压缩图像
            self._resize_image(path, max_size=self.max_size)
        return base64.b64encode(path.read_bytes()).decode()

    def analyze(self, image_path: str, prompt: str) -> str:
        """图像分析"""
        base64_image = self.encode_image(image_path)
        return self._call_vlm(base64_image, prompt)
```

```java
// Java: 图像处理服务
@Service
public class VisionService {
    private final LlmClient llmClient;
    private static final long MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB

    public String analyzeImage(Path imagePath, String prompt) {
        validateImage(imagePath);
        String base64 = Base64.getEncoder().encodeToString(Files.readAllBytes(imagePath));
        return llmClient.analyzeImage(base64, prompt, detectMediaType(imagePath));
    }

    private void validateImage(Path path) {
        if (Files.size(path) > MAX_IMAGE_SIZE) {
            throw new ImageTooLargeException(path, MAX_IMAGE_SIZE);
        }
    }
}
```

## 多模态 RAG 模式

```
文档/PDF
  → 图像提取（页面截图 / 图表）
  → VLM 描述生成（每个图像的文本描述）
  → Embedding（文本 + 图像描述）
  → 向量数据库存储
  → 查询时：文本检索 + 图像描述检索
  → LLM 综合回答（引用文本 + 图像）
```

## 安全要求

- 验证图像格式和大小（防止恶意文件上传）
- 图像 URL 必须验证域名白名单（防止 SSRF）
- 不存储原始图像到 Prompt 日志
- 敏感图像（身份证、护照）需脱敏处理

## 成本优化

- 缓存 VLM 结果（相同图像 + 相同 Prompt）
- 批量处理多个图像（减少 API 调用次数）
- 图像预处理：裁剪、压缩到最小有效尺寸
- 按需选择模型精度（简单 OCR 用本地模型，复杂推理用 GPT-4V）

## 反模式（禁止）

- ❌ 无大小验证的图像上传
- ❌ 直接将外部 URL 传入 API（SSRF 风险）
- ❌ 存储原始图像 base64 到数据库
- ❌ 所有场景都用最贵的 VLM 模型
