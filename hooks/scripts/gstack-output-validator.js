#!/usr/bin/env node

/**
 * GStack Output Validator - Validates GStack output documents match expected schema.
 *
 * Trigger: PostToolUse on Write when file path includes workspace/docs/design/
 *
 * Exit codes:
 *   0 - Pass (valid or not a GStack file)
 *   1 - Warning (invalid GStack file)
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = process.env.FILE_PATH || '';
const TOOL_INPUT = process.env.TOOL_INPUT || '{}';

const GSTACK_FILES = {
  'DESIGN.md': {
    requiredSections: ['设计哲学', '竞品分析', '设计令牌', '组件清单'],
    minSize: 500
  },
  'OFFICE_HOURS.md': {
    requiredSections: ['产品定义', '问题与用户', '竞争优势', '核心功能'],
    minSize: 300
  },
  'IMPLEMENTATION_PLAN.md': {
    requiredSections: ['总体评分', 'CEO 审查', '设计审查', '工程审查'],
    minSize: 500
  },
  'IMPLEMENTATION_PLAN.json': {
    requiredFields: ['overallScore', 'dimensions'],
    minSize: 100
  }
};

function getFilename(filePath) {
  return path.basename(filePath);
}

function isGstackFile(filePath) {
  const filename = getFilename(filePath);
  return filePath.includes('docs/design/') && GSTACK_FILES.hasOwnProperty(filename);
}

function validateGstackFile(filePath, content) {
  const filename = getFilename(filePath);
  const schema = GSTACK_FILES[filename];
  const issues = [];

  // Size check
  if (content.length < schema.minSize) {
    issues.push(`File too small: ${content.length} bytes (minimum: ${schema.minSize})`);
  }

  // Section/field checks
  if (filename.endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      schema.requiredFields.forEach(field => {
        if (!data.hasOwnProperty(field)) {
          issues.push(`Missing required field: ${field}`);
        }
      });
      if (data.overallScore && (data.overallScore < 0 || data.overallScore > 10)) {
        issues.push(`Invalid overallScore: ${data.overallScore} (must be 0-10)`);
      }
    } catch (e) {
      issues.push(`Invalid JSON: ${e.message}`);
    }
  } else {
    schema.requiredSections.forEach(section => {
      if (!content.includes(section)) {
        issues.push(`Missing required section: ${section}`);
      }
    });
  }

  return issues;
}

// Main
if (!isGstackFile(FILE_PATH)) {
  process.exit(0);
}

// Read the file content
let content;
try {
  const parsed = JSON.parse(TOOL_INPUT);
  content = parsed.content || '';
} catch (e) {
  try {
    content = fs.readFileSync(FILE_PATH, 'utf8');
  } catch (e2) {
    process.exit(0);
  }
}

const issues = validateGstackFile(FILE_PATH, content);
if (issues.length > 0) {
  console.log(`[GStack Validator] Issues in ${getFilename(FILE_PATH)}:`);
  issues.forEach(i => console.log(`  ⚠ ${i}`));
  process.exit(1);
}

process.exit(0);
