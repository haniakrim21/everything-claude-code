#!/usr/bin/env node

/**
 * Multi-Agent Runner for Claude Code
 *
 * Usage:
 *   node scripts/multi-agent-runner.mjs "review this project"
 *   node scripts/multi-agent-runner.mjs --agents "security-reviewer,code-reviewer" --task "audit auth module"
 *   node scripts/multi-agent-runner.mjs --preset full-review
 *
 * Presets:
 *   full-review    - Security + Performance + Code Quality + Docs
 *   security-audit - Security + Penetration testing
 *   code-quality   - Code review + Refactoring suggestions
 *   new-project    - Architecture + Tech stack + Setup
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const AGENTS_DIR = join(process.env.HOME, ".claude", "agents");

const PRESETS = {
  "full-review": [
    { agent: "security-reviewer", task: "Perform a security audit" },
    { agent: "performance-engineer", task: "Analyze performance bottlenecks" },
    { agent: "code-reviewer", task: "Review code quality and patterns" },
    { agent: "documentation-engineer", task: "Check documentation completeness" },
  ],
  "security-audit": [
    { agent: "security-reviewer", task: "Review code for vulnerabilities" },
    { agent: "penetration-tester", task: "Identify attack surfaces" },
  ],
  "code-quality": [
    { agent: "code-reviewer", task: "Review code quality" },
    { agent: "refactor-cleaner", task: "Suggest refactoring improvements" },
    { agent: "typescript-pro", task: "Check type safety and TS best practices" },
  ],
  "new-project": [
    { agent: "architect", task: "Evaluate architecture decisions" },
    { agent: "cloud-architect", task: "Review infrastructure setup" },
    { agent: "devops-engineer", task: "Check CI/CD and deployment config" },
  ],
};

function listAgents() {
  try {
    return readdirSync(AGENTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""));
  } catch {
    return [];
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = { agents: [], task: "", preset: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--agents" && args[i + 1]) {
      config.agents = args[++i].split(",").map((a) => a.trim());
    } else if (args[i] === "--task" && args[i + 1]) {
      config.task = args[++i];
    } else if (args[i] === "--preset" && args[i + 1]) {
      config.preset = args[++i];
    } else if (args[i] === "--list") {
      console.log("Available agents:", listAgents().join(", "));
      console.log("\nPresets:", Object.keys(PRESETS).join(", "));
      process.exit(0);
    } else if (!args[i].startsWith("--")) {
      config.task = args.slice(i).join(" ");
      break;
    }
  }

  return config;
}

function buildPrompt(agentName, task, projectContext) {
  return `You are acting as the ${agentName} agent.

Project context:
${projectContext}

Task: ${task}

Provide a focused analysis from your specialty perspective. Be specific with file paths and line numbers.`;
}

async function runAgent(agentName, task, projectContext) {
  const prompt = buildPrompt(agentName, task, projectContext);
  const start = Date.now();

  console.log(`  [${agentName}] Starting...`);

  try {
    const result = execSync(
      `claude --print "${prompt.replace(/"/g, '\\"')}"`,
      {
        encoding: "utf8",
        timeout: 120000,
        maxBuffer: 1024 * 1024 * 10,
      }
    );

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  [${agentName}] Done (${elapsed}s)`);

    return { agent: agentName, result, elapsed, success: true };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  [${agentName}] Failed (${elapsed}s)`);

    return {
      agent: agentName,
      result: err.message,
      elapsed,
      success: false,
    };
  }
}

function getProjectContext() {
  const cwd = process.cwd();
  let context = `Working directory: ${cwd}\n`;

  try {
    const pkg = readFileSync(join(cwd, "package.json"), "utf8");
    context += `package.json: ${pkg.slice(0, 500)}\n`;
  } catch {}

  try {
    const readme = readFileSync(join(cwd, "README.md"), "utf8");
    context += `README (first 500 chars): ${readme.slice(0, 500)}\n`;
  } catch {}

  try {
    const files = execSync("git ls-files | head -50", {
      encoding: "utf8",
      cwd,
    });
    context += `Key files:\n${files}\n`;
  } catch {}

  return context;
}

async function main() {
  const config = parseArgs();

  if (!config.task && !config.preset) {
    console.log(`
Multi-Agent Runner - Run multiple Claude Code agents in parallel

Usage:
  node scripts/multi-agent-runner.mjs "review this project"
  node scripts/multi-agent-runner.mjs --preset full-review
  node scripts/multi-agent-runner.mjs --agents "security-reviewer,code-reviewer" --task "audit auth"
  node scripts/multi-agent-runner.mjs --list

Presets: ${Object.keys(PRESETS).join(", ")}
    `);
    process.exit(0);
  }

  let jobs = [];

  if (config.preset && PRESETS[config.preset]) {
    jobs = PRESETS[config.preset].map((p) => ({
      agent: p.agent,
      task: config.task || p.task,
    }));
  } else if (config.agents.length > 0) {
    jobs = config.agents.map((a) => ({ agent: a, task: config.task }));
  } else {
    // Auto-select agents based on task
    jobs = [
      { agent: "code-reviewer", task: config.task },
      { agent: "security-reviewer", task: config.task },
    ];
  }

  console.log(`\n🚀 Running ${jobs.length} agents in parallel...\n`);

  const projectContext = getProjectContext();

  const results = await Promise.all(
    jobs.map((j) => runAgent(j.agent, j.task, projectContext))
  );

  console.log("\n" + "=".repeat(60));
  console.log("MULTI-AGENT RESULTS");
  console.log("=".repeat(60));

  for (const r of results) {
    console.log(`\n--- ${r.agent} (${r.elapsed}s) ${r.success ? "✓" : "✗"} ---`);
    console.log(r.result);
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `\n${successCount}/${results.length} agents completed successfully.`
  );
}

main().catch(console.error);
