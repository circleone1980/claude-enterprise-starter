const fs = require('fs');

function parseFrontmatter(content) {
  // Normalize line endings for cross-platform support (Windows \r\n -> \n)
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const raw = match[1];
  const result = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      result[m[1]] = val;
    }
  }
  return result;
}

function parseMD(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fm = parseFrontmatter(content);
  return { frontmatter: fm, content };
}

module.exports = { parseFrontmatter, parseMD };
