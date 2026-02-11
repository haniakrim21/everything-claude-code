#!/usr/bin/env node

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const WebSocket = require("ws");

// --- CLI Args ---
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}
const PORT = parseInt(getArg("--port") || "3333", 10);
const ROOT_ARG = getArg("--root");

// --- Project Root Detection ---
function findProjectRoot(startDir) {
  let dir = startDir;
  const markers = [".git", "package.json", "go.mod", "Cargo.toml", "pyproject.toml"];
  while (dir !== path.dirname(dir)) {
    if (markers.some((m) => fs.existsSync(path.join(dir, m)))) return dir;
    dir = path.dirname(dir);
  }
  return startDir;
}
const PROJECT_ROOT = ROOT_ARG
  ? path.resolve(ROOT_ARG)
  : findProjectRoot(process.cwd());

// --- Security: path validation ---
function safePath(requestedPath) {
  const resolved = path.resolve(PROJECT_ROOT, requestedPath);
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error("Path outside project root");
  }
  return resolved;
}

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build",
  "__pycache__", ".venv", "venv", ".idea", ".vscode",
  "coverage", ".turbo", ".cache",
]);

// --- Express Setup ---
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// --- File System Routes ---
app.get("/api/files", (req, res) => {
  try {
    const dir = safePath(req.query.dir || ".");
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const items = entries
      .filter((e) => !IGNORED_DIRS.has(e.name) && !e.name.startsWith("."))
      .map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "dir" : "file",
        path: path.relative(PROJECT_ROOT, path.join(dir, e.name)),
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    res.json({ root: path.relative(PROJECT_ROOT, dir) || ".", items });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/file", (req, res) => {
  try {
    const filePath = safePath(req.query.path);
    const content = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(filePath).slice(1);
    res.json({ path: req.query.path, content, ext });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/file", (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    const safe = safePath(filePath);
    fs.writeFileSync(safe, content, "utf8");
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/search", (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase();
    if (!query) return res.json({ results: [] });
    const results = [];
    function walk(dir, depth) {
      if (depth > 5 || results.length > 50) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (IGNORED_DIRS.has(e.name) || e.name.startsWith(".")) continue;
        const full = path.join(dir, e.name);
        const rel = path.relative(PROJECT_ROOT, full);
        if (e.name.toLowerCase().includes(query)) {
          results.push({ name: e.name, path: rel, type: e.isDirectory() ? "dir" : "file" });
        }
        if (e.isDirectory()) walk(full, depth + 1);
      }
    }
    walk(PROJECT_ROOT, 0);
    res.json({ results: results.slice(0, 50) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Database Routes ---
let dbPool = null;

app.get("/api/db/env", (_req, res) => {
  try {
    const envPath = path.join(PROJECT_ROOT, ".env");
    if (!fs.existsSync(envPath)) return res.json({ vars: {} });
    const content = fs.readFileSync(envPath, "utf8");
    const vars = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^(DB_|PG|DATABASE_|POSTGRES_)([A-Z_]+)=(.+)/i);
      if (match) vars[match[1] + match[2]] = match[3].replace(/^["']|["']$/g, "");
    }
    res.json({ vars });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/db/connect", async (req, res) => {
  try {
    const { host, port, user, password, database } = req.body;
    const { Pool } = require("pg");
    if (dbPool) await dbPool.end().catch(() => {});
    dbPool = new Pool({ host, port: parseInt(port, 10), user, password, database, max: 5 });
    await dbPool.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    dbPool = null;
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/db/tables", async (_req, res) => {
  if (!dbPool) return res.status(400).json({ error: "Not connected" });
  try {
    const { rows } = await dbPool.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    res.json({ tables: rows.map((r) => r.tablename) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/db/table/:name", async (req, res) => {
  if (!dbPool) return res.status(400).json({ error: "Not connected" });
  try {
    const table = req.params.name.replace(/[^a-zA-Z0-9_]/g, "");
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50", 10)));
    const offset = (page - 1) * limit;
    const countResult = await dbPool.query(`SELECT COUNT(*) FROM "${table}"`);
    const total = parseInt(countResult.rows[0].count, 10);
    const { rows, fields } = await dbPool.query(
      `SELECT * FROM "${table}" LIMIT $1 OFFSET $2`, [limit, offset]
    );
    res.json({
      table, rows, columns: fields.map((f) => f.name),
      total, page, pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/db/query", async (req, res) => {
  if (!dbPool) return res.status(400).json({ error: "Not connected" });
  try {
    const { sql } = req.body;
    const start = Date.now();
    const result = await dbPool.query(sql);
    const time = Date.now() - start;
    res.json({
      rows: result.rows || [],
      columns: (result.fields || []).map((f) => f.name),
      rowCount: result.rowCount,
      time,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/db/update", async (req, res) => {
  if (!dbPool) return res.status(400).json({ error: "Not connected" });
  try {
    const { table, column, value, whereColumn, whereValue } = req.body;
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, "");
    const safeCol = column.replace(/[^a-zA-Z0-9_]/g, "");
    const safeWhereCol = whereColumn.replace(/[^a-zA-Z0-9_]/g, "");
    await dbPool.query(
      `UPDATE "${safeTable}" SET "${safeCol}" = $1 WHERE "${safeWhereCol}" = $2`,
      [value, whereValue]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- API Proxy ---
app.post("/api/proxy", async (req, res) => {
  try {
    const { method, url, headers, body } = req.body;
    const start = Date.now();
    const fetchOpts = {
      method: method || "GET",
      headers: headers || {},
    };
    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOpts.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const response = await fetch(url, fetchOpts);
    const time = Date.now() - start;
    const respHeaders = {};
    response.headers.forEach((v, k) => { respHeaders[k] = v; });
    let respBody;
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("json")) {
      respBody = await response.json();
    } else {
      respBody = await response.text();
    }
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
      body: respBody,
      time,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- WebSocket Terminal ---
let nodePty;
try {
  nodePty = require("node-pty");
} catch (_e) {
  console.warn("[DevBoard] node-pty not available — terminal will use basic mode");
}

const wss = new WebSocket.Server({ server, path: "/ws/terminal" });

wss.on("connection", (ws) => {
  const shell = os.platform() === "win32" ? "powershell.exe" : process.env.SHELL || "/bin/bash";

  if (nodePty) {
    const pty = nodePty.spawn(shell, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: PROJECT_ROOT,
      env: { ...process.env, TERM: "xterm-256color" },
    });
    pty.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });
    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === "input") pty.write(parsed.data);
        if (parsed.type === "resize") pty.resize(parsed.cols || 80, parsed.rows || 24);
      } catch (_e) {
        pty.write(msg.toString());
      }
    });
    ws.on("close", () => pty.kill());
  } else {
    // Fallback: basic child_process
    const proc = spawn(shell, [], { cwd: PROJECT_ROOT, env: { ...process.env, TERM: "dumb" } });
    proc.stdout.on("data", (d) => ws.readyState === WebSocket.OPEN && ws.send(d.toString()));
    proc.stderr.on("data", (d) => ws.readyState === WebSocket.OPEN && ws.send(d.toString()));
    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === "input") proc.stdin.write(parsed.data);
      } catch (_e) {
        proc.stdin.write(msg.toString());
      }
    });
    ws.on("close", () => proc.kill());
  }
});

// --- Start Server ---
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  DevBoard running at ${url}`);
  console.log(`  Project root: ${PROJECT_ROOT}\n`);

  const cmds = {
    darwin: ["open", ["-a", "Google Chrome", url]],
    win32: ["cmd", ["/c", "start", "chrome", url]],
    linux: ["xdg-open", [url]],
  };
  const cmd = cmds[os.platform()];
  if (cmd) {
    spawn(cmd[0], cmd[1], { detached: true, stdio: "ignore" }).unref();
  }
});
