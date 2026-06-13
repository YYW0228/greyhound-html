// frontmatter.ts — 自实现 frontmatter 解析/序列化
// 替代 baoyu-md 的 parseFrontmatter / serializeFrontmatter

export interface FrontmatterFields {
  title?: string;
  author?: string;
  description?: string;
  summary?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

/** 解析 --- 包裹的 YAML frontmatter */
export function parseFrontmatter(content: string): {
  frontmatter: FrontmatterFields;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: FrontmatterFields = {};
  const lines = match[1]!.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx <= 0) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    frontmatter[key] = stripWrappingQuotes(value);
  }

  return { frontmatter, body: match[2]! };
}

/** 将 frontmatter 序列化为 --- 包裹的字符串 */
export function serializeFrontmatter(frontmatter: FrontmatterFields): string {
  const keys = Object.keys(frontmatter);
  if (keys.length === 0) return "";
  const lines = ["---"];
  for (const key of keys) {
    const val = frontmatter[key];
    if (val === undefined || val === null) continue;
    lines.push(`${key}: ${String(val)}`);
  }
  lines.push("---\n");
  return lines.join("\n");
}

/** 去除外层引号 */
export function stripWrappingQuotes(s: string): string {
  if (!s) return s;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
