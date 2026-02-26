#!/usr/bin/env node
/**
 * Validate agent markdown files have required frontmatter
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '../../agents');
const PLUGIN_JSON = path.join(__dirname, '../../.claude-plugin/plugin.json');
const REQUIRED_FIELDS = ['name', 'description', 'tools', 'model'];

function extractFrontmatter(content) {
  // Strip BOM if present (UTF-8 BOM: \uFEFF)
  const cleanContent = content.replace(/^\uFEFF/, '');
  // Support both LF and CRLF line endings
  const match = cleanContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      frontmatter[key] = value;
    }
  }
  return frontmatter;
}

function validateAgents() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.log('No agents directory found, skipping validation');
    process.exit(0);
  }

  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
  let hasErrors = false;

  for (const file of files) {
    const filePath = path.join(AGENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      console.error(`ERROR: ${file} - Missing frontmatter`);
      hasErrors = true;
      continue;
    }

    for (const field of REQUIRED_FIELDS) {
      if (!frontmatter[field]) {
        console.error(`ERROR: ${file} - Missing required field: ${field}`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  // Cross-check plugin.json registers agents
  if (fs.existsSync(PLUGIN_JSON)) {
    let plugin;
    try {
      plugin = JSON.parse(fs.readFileSync(PLUGIN_JSON, 'utf-8'));
    } catch (e) {
      console.error(`ERROR: Invalid JSON in plugin.json: ${e.message}`);
      process.exit(1);
    }

    if (!plugin.agents) {
      console.error('ERROR: plugin.json is missing "agents" field — agents will not be registered');
      process.exit(1);
    }

    const agentsEntry = plugin.agents;
    const hasDirectoryEntry = Array.isArray(agentsEntry) &&
      agentsEntry.some(e => typeof e === 'string' && e.includes('agents'));
    if (!hasDirectoryEntry) {
      console.error('ERROR: plugin.json "agents" field does not reference the agents/ directory');
      process.exit(1);
    }
  }

  console.log(`Validated ${files.length} agent files`);
}

validateAgents();
