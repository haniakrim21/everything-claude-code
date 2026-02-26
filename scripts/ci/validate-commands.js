#!/usr/bin/env node
/**
 * Validate command markdown files are non-empty and readable
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '../../commands');

function parseFrontmatter(content) {
  if (!content.trim().startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = content.slice(3, end).trim();
  const fm = {};
  for (const line of block.split('\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
      fm[key] = val;
    }
  }
  return fm;
}

function validateCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) {
    console.log('No commands directory found, skipping validation');
    process.exit(0);
  }

  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(COMMANDS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.trim().length === 0) {
      console.error(`ERROR: ${file} - Empty command file`);
      hasErrors = true;
      continue;
    }

    if (!content.trim().startsWith('---')) {
      console.error(`ERROR: ${file} - Missing YAML frontmatter`);
      hasErrors = true;
      continue;
    }

    const fm = parseFrontmatter(content);
    if (!fm || !fm.description) {
      console.error(`ERROR: ${file} - Missing required 'description' field in frontmatter`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`Validated ${files.length} command files`);
}

validateCommands();
