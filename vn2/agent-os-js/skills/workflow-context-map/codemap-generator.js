#!/usr/bin/env node
/**
 * codemap-generator.js
 * Auto-generates CODEMAP.md from a project codebase.
 * Usage: node codemap-generator.js [projectRoot] [--watch]
 *
 * Agent OS Rule: Output must be < 18,000 chars to avoid AI context truncation.
 */

const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const CONFIG = {
  maxChars: 17500,         // Hard limit: < 18000 to avoid AI truncation
  maxDepth: 4,             // Max directory scan depth
  outputFile: 'CODEMAP.md',
  ignore: new Set([
    'node_modules', '.git', '.DS_Store', 'dist', 'build',
    '.cache', 'coverage', '.next', '__pycache__', '.venv',
  ]),
  // File extensions to include in scan
  include: new Set([
    '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
    '.css', '.scss', '.sass', '.less',
    '.html', '.htm',
    '.json', '.md',
    '.php',
  ]),
  // Files to always describe with extra detail
  entryPoints: new Set(['index.html', 'index.js', 'main.js', 'app.js', 'index.ts', 'main.ts']),
};

// ─── CATEGORY DETECTION ──────────────────────────────────────────────────────

/**
 * Detect file category based on path patterns.
 * Returns category label for grouping in CODEMAP.
 */
function detectCategory(filePath) {
  const lower = filePath.toLowerCase();
  const base = path.basename(lower);

  if (CONFIG.entryPoints.has(base)) return 'Entry Points';
  if (lower.includes('/animation') || lower.includes('/anim') || lower.includes('/gsap')) return 'Animation Modules';
  if (lower.includes('/component')) return 'Components';
  if (lower.includes('/core') || lower.includes('/util') || lower.includes('/lib') || lower.includes('/helper')) return 'Core Utilities';
  if (lower.includes('/vendor') || lower.includes('/third-party')) return 'Vendor (Read-only)';
  if (lower.includes('/data') || lower.endsWith('.json')) return 'Config & Data';
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.includes('/style') || lower.includes('/css')) return 'Styles';
  if (lower.includes('/page') || lower.endsWith('.html')) return 'Pages';
  if (lower.includes('/test') || lower.includes('.test.') || lower.includes('.spec.')) return 'Tests';
  if (lower.endsWith('.php')) return 'PHP (Backend)';
  if (lower.endsWith('.md')) return null; // skip md files from map

  return 'Shared JavaScript';
}

// ─── QUICK DESCRIPTION EXTRACTION ────────────────────────────────────────────

/**
 * Read first 20 lines of a file and extract a short description.
 * Looks for: JSDoc @description, // comments, first export name.
 */
function extractDescription(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, 20);

    // Look for @description or @module JSDoc
    for (const line of lines) {
      const match = line.match(/@(?:description|module|file)\s+(.+)/);
      if (match) return match[1].trim();
    }

    // Look for first meaningful comment
    for (const line of lines) {
      const comment = line.match(/^\s*\/\/\s*(.{10,80})/);
      if (comment && !comment[1].startsWith('=') && !comment[1].startsWith('-')) {
        return comment[1].trim();
      }
    }

    // Look for export default class/function name
    for (const line of lines) {
      const exportMatch = line.match(/export\s+(?:default\s+)?(?:class|function)\s+(\w+)/);
      if (exportMatch) return `${exportMatch[1]} module`;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── FILESYSTEM WALKER ────────────────────────────────────────────────────────

/**
 * Walk directory tree, collect files grouped by category.
 * Returns: Map<category, Array<{path, description}>>
 */
function walkDir(rootDir, currentDir, depth, categories) {
  if (depth > CONFIG.maxDepth) return;

  let entries;
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (CONFIG.ignore.has(entry.name)) continue;
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      walkDir(rootDir, fullPath, depth + 1, categories);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!CONFIG.include.has(ext)) continue;

      const category = detectCategory(relPath);
      if (category === null) continue; // skip .md files

      if (!categories.has(category)) categories.set(category, []);

      const desc = extractDescription(fullPath);
      categories.get(category).push({ path: relPath, description: desc });
    }
  }
}

// ─── NOT TOUCHED DETECTION ───────────────────────────────────────────────────

/**
 * Detect directories that should be marked NOT TOUCHED.
 */
function detectNotTouched(rootDir) {
  const notTouched = [];
  const checkDirs = ['src/core', 'src/vendor', 'vendor', 'node_modules', 'dist', 'build'];

  for (const dir of checkDirs) {
    const fullPath = path.join(rootDir, dir);
    if (fs.existsSync(fullPath)) {
      notTouched.push(`- \`${dir}/\` — Read-only (no direct edits without /review approval)`);
    }
  }

  return notTouched;
}

// ─── MARKDOWN GENERATOR ───────────────────────────────────────────────────────

/**
 * Generate CODEMAP.md content from category map.
 */
function generateCODEMAP(projectRoot, categories) {
  const projectName = path.basename(projectRoot);
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

  // Category display order
  const ORDER = [
    'Entry Points',
    'Animation Modules',
    'Components',
    'Core Utilities',
    'Pages',
    'Shared JavaScript',
    'Styles',
    'Config & Data',
    'PHP (Backend)',
    'Tests',
    'Vendor (Read-only)',
  ];

  let output = `# CODEMAP — ${projectName}
> Auto-generated by \`codemap-generator.js\`. Re-run \`/map\` when codebase changes.
> Last updated: ${timestamp}
> ⚠️ AI: Read this file first. Do NOT run ls/find/grep to explore — answer from this map.

`;

  // Sort categories by ORDER, put unknowns at end
  const sorted = [...categories.entries()].sort(([a], [b]) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  for (const [category, files] of sorted) {
    if (files.length === 0) continue;
    output += `## ${category}\n`;
    for (const file of files) {
      const desc = file.description ? ` — ${file.description}` : '';
      output += `- \`${file.path}\`${desc}\n`;
    }
    output += '\n';
  }

  // NOT TOUCHED section
  const notTouched = detectNotTouched(projectRoot);
  if (notTouched.length > 0) {
    output += `## NOT TOUCHED (Do not modify without explicit /review approval)\n`;
    output += notTouched.join('\n') + '\n\n';
  }

  // Stats
  const totalFiles = [...categories.values()].reduce((sum, arr) => sum + arr.length, 0);
  output += `---\n`;
  output += `> Stats: ${totalFiles} files mapped across ${categories.size} categories.\n`;

  return output;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const projectRoot = path.resolve(args[0] || '.');
  const outputPath = path.join(projectRoot, CONFIG.outputFile);

  console.log(`\n📍 Scanning: ${projectRoot}`);
  console.log(`📄 Output:   ${outputPath}\n`);

  // Walk and collect
  const categories = new Map();
  walkDir(projectRoot, projectRoot, 0, categories);

  if (categories.size === 0) {
    console.error('❌ No files found. Check projectRoot and CONFIG.include extensions.');
    process.exit(1);
  }

  // Generate content
  let content = generateCODEMAP(projectRoot, categories);

  // Enforce char limit
  if (content.length > CONFIG.maxChars) {
    console.warn(`\n⚠️  CODEMAP exceeds ${CONFIG.maxChars} chars (${content.length} chars).`);
    console.warn('   Truncating to fit AI context window. Consider reducing scan depth.\n');
    content = content.slice(0, CONFIG.maxChars) + '\n\n> ⚠️ TRUNCATED — run /map with --depth 2 to reduce size.\n';
  }

  // Write file
  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(`✅ CODEMAP.md generated: ${content.length.toLocaleString()} / ${CONFIG.maxChars.toLocaleString()} chars`);
  console.log(`   Categories: ${categories.size}`);
  console.log(`   Files:      ${[...categories.values()].reduce((s, a) => s + a.length, 0)}`);
  console.log(`\n👉 Next: Update PATTERNS.md manually with verified recipes.`);
  console.log(`   Then commit both files to repo.\n`);
}

main();
