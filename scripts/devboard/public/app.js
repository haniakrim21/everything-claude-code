/* DevBoard Client */

// --- State ---
let editor = null;
let currentFilePath = null;
let editorReady = false;
const terminals = [];
let activeTerminal = -1;
let dbCurrentTable = null;
let dbCurrentPage = 1;
let dbTotalPages = 1;

// --- Tab Switching ---
function switchTab(name) {
  document.querySelectorAll("[id^='panel-']").forEach((p) => p.classList.add("hidden"));
  document.querySelectorAll("[id^='tab-']").forEach((t) => t.classList.remove("tab-active"));
  document.getElementById("panel-" + name).classList.remove("hidden");
  document.getElementById("tab-" + name).classList.add("tab-active");
  if (name === "terminal" && terminals.length === 0) createTerminal();
  if (name === "terminal" && terminals[activeTerminal]) {
    terminals[activeTerminal].fitAddon.fit();
  }
}

// --- File Editor ---
async function loadFileTree(dir) {
  const res = await fetch("/api/files?dir=" + encodeURIComponent(dir || "."));
  const data = await res.json();
  if (dir === undefined || dir === ".") {
    document.getElementById("project-root").textContent = "Project: " + (data.root || ".");
  }
  return data.items || [];
}

function renderTree(items, container, parentPath) {
  container.innerHTML = "";
  for (const item of items) {
    const el = document.createElement("div");
    el.className = "file-tree-item px-2 py-0.5 cursor-pointer rounded flex items-center gap-1.5";
    const icon = item.type === "dir" ? "📁" : "📄";
    el.innerHTML = `<span class="text-xs">${icon}</span><span class="truncate">${item.name}</span>`;
    if (item.type === "dir") {
      let expanded = false;
      const children = document.createElement("div");
      children.className = "pl-3 hidden";
      el.onclick = async (e) => {
        e.stopPropagation();
        expanded = !expanded;
        if (expanded && children.children.length === 0) {
          const subItems = await loadFileTree(item.path);
          renderTree(subItems, children, item.path);
        }
        children.classList.toggle("hidden", !expanded);
      };
      container.appendChild(el);
      container.appendChild(children);
    } else {
      el.onclick = () => openFile(item.path);
      container.appendChild(el);
    }
  }
}

async function openFile(filePath) {
  const res = await fetch("/api/file?path=" + encodeURIComponent(filePath));
  const data = await res.json();
  if (data.error) return alert(data.error);
  currentFilePath = filePath;
  document.getElementById("current-file").textContent = filePath;
  if (editor) {
    const langMap = {
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      py: "python", go: "go", rs: "rust", json: "json", md: "markdown",
      html: "html", css: "css", sql: "sql", yaml: "yaml", yml: "yaml",
      sh: "shell", bash: "shell", toml: "ini", env: "ini",
    };
    const lang = langMap[data.ext] || "plaintext";
    const model = monaco.editor.createModel(data.content, lang);
    editor.setModel(model);
  }
}

async function saveFile() {
  if (!currentFilePath || !editor) return;
  const res = await fetch("/api/file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: currentFilePath, content: editor.getValue() }),
  });
  const data = await res.json();
  if (data.ok) {
    document.getElementById("current-file").textContent = currentFilePath + " (saved)";
    setTimeout(() => {
      document.getElementById("current-file").textContent = currentFilePath;
    }, 1500);
  }
}

let searchTimeout = null;
async function searchFiles(query) {
  clearTimeout(searchTimeout);
  if (!query) { initFileTree(); return; }
  searchTimeout = setTimeout(async () => {
    const res = await fetch("/api/search?q=" + encodeURIComponent(query));
    const data = await res.json();
    const container = document.getElementById("file-tree");
    container.innerHTML = "";
    for (const item of data.results || []) {
      const el = document.createElement("div");
      el.className = "file-tree-item px-2 py-0.5 cursor-pointer rounded text-xs truncate";
      el.textContent = item.path;
      if (item.type === "file") el.onclick = () => openFile(item.path);
      container.appendChild(el);
    }
  }, 300);
}

async function initFileTree() {
  const items = await loadFileTree(".");
  renderTree(items, document.getElementById("file-tree"), ".");
}

// --- Database ---
async function loadEnvDefaults() {
  const res = await fetch("/api/db/env");
  const data = await res.json();
  const v = data.vars || {};
  if (v.DATABASE_URL || v.DB_URL || v.POSTGRES_URL) {
    try {
      const url = new URL(v.DATABASE_URL || v.DB_URL || v.POSTGRES_URL);
      document.getElementById("db-host").value = url.hostname || "localhost";
      document.getElementById("db-port").value = url.port || "5432";
      document.getElementById("db-user").value = url.username || "postgres";
      document.getElementById("db-pass").value = url.password || "";
      document.getElementById("db-name").value = url.pathname.slice(1) || "";
    } catch (_e) { /* ignore parse errors */ }
  } else {
    if (v.DB_HOST || v.PGHOST) document.getElementById("db-host").value = v.DB_HOST || v.PGHOST;
    if (v.DB_PORT || v.PGPORT) document.getElementById("db-port").value = v.DB_PORT || v.PGPORT;
    if (v.DB_USER || v.PGUSER || v.POSTGRES_USER) document.getElementById("db-user").value = v.DB_USER || v.PGUSER || v.POSTGRES_USER;
    if (v.DB_PASSWORD || v.PGPASSWORD || v.POSTGRES_PASSWORD) document.getElementById("db-pass").value = v.DB_PASSWORD || v.PGPASSWORD || v.POSTGRES_PASSWORD;
    if (v.DB_NAME || v.PGDATABASE || v.POSTGRES_DB) document.getElementById("db-name").value = v.DB_NAME || v.PGDATABASE || v.POSTGRES_DB;
  }
}

async function connectDB() {
  const status = document.getElementById("db-status");
  status.textContent = "Connecting...";
  status.className = "text-xs text-yellow-400";
  const res = await fetch("/api/db/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host: document.getElementById("db-host").value,
      port: document.getElementById("db-port").value,
      user: document.getElementById("db-user").value,
      password: document.getElementById("db-pass").value,
      database: document.getElementById("db-name").value,
    }),
  });
  const data = await res.json();
  if (data.ok) {
    status.textContent = "Connected";
    status.className = "text-xs text-green-400";
    document.getElementById("db-tables").classList.remove("hidden");
    loadTables();
  } else {
    status.textContent = data.error;
    status.className = "text-xs text-red-400";
  }
}

async function loadTables() {
  const res = await fetch("/api/db/tables");
  const data = await res.json();
  const list = document.getElementById("db-table-list");
  list.innerHTML = "";
  for (const t of data.tables || []) {
    const el = document.createElement("div");
    el.className = "file-tree-item px-2 py-0.5 cursor-pointer rounded text-sm";
    el.textContent = t;
    el.onclick = () => loadTableData(t, 1);
    list.appendChild(el);
  }
}

async function loadTableData(table, page) {
  dbCurrentTable = table;
  dbCurrentPage = page;
  const res = await fetch(`/api/db/table/${table}?page=${page}&limit=50`);
  const data = await res.json();
  dbTotalPages = data.pages;
  renderDBTable(data);
  document.getElementById("db-pagination").classList.remove("hidden");
  document.getElementById("db-pagination").classList.add("flex");
  document.getElementById("db-page-info").textContent = `Page ${data.page} / ${data.pages} (${data.total} rows)`;
}

function dbPrevPage() { if (dbCurrentPage > 1) loadTableData(dbCurrentTable, dbCurrentPage - 1); }
function dbNextPage() { if (dbCurrentPage < dbTotalPages) loadTableData(dbCurrentTable, dbCurrentPage + 1); }

async function runQuery() {
  const sql = document.getElementById("sql-input").value.trim();
  if (!sql) return;
  const status = document.getElementById("query-status");
  status.textContent = "Running...";
  const res = await fetch("/api/db/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql }),
  });
  const data = await res.json();
  if (data.error) {
    status.textContent = data.error;
    status.className = "text-xs text-red-400";
  } else {
    status.textContent = `${data.rowCount ?? data.rows.length} rows — ${data.time}ms`;
    status.className = "text-xs text-green-400";
    renderDBTable(data);
  }
}

function renderDBTable(data) {
  const container = document.getElementById("db-results");
  if (!data.rows || data.rows.length === 0) {
    container.innerHTML = '<p class="text-slate-500 text-sm">No results.</p>';
    return;
  }
  const cols = data.columns || Object.keys(data.rows[0]);
  let html = '<table class="w-full text-xs"><thead><tr>';
  for (const c of cols) html += `<th class="text-left px-2 py-1 border-b border-slate-800 text-slate-400 font-medium">${c}</th>`;
  html += "</tr></thead><tbody>";
  for (const row of data.rows) {
    html += "<tr>";
    for (const c of cols) {
      const val = row[c] === null ? '<span class="text-slate-600">NULL</span>' : String(row[c]);
      html += `<td class="px-2 py-1 border-b border-slate-800/50 font-mono" contenteditable="true"
        data-table="${data.table || ""}" data-col="${c}" data-pk-col="${cols[0]}" data-pk-val="${row[cols[0]]}"
        onblur="handleCellEdit(this)">${val}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  container.innerHTML = html;
}

async function handleCellEdit(td) {
  const table = td.dataset.table;
  if (!table) return;
  const res = await fetch("/api/db/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table, column: td.dataset.col, value: td.textContent,
      whereColumn: td.dataset.pkCol, whereValue: td.dataset.pkVal,
    }),
  });
  const data = await res.json();
  if (data.ok) td.style.background = "";
  else alert("Update failed: " + data.error);
}

// --- API Tester ---
function addHeaderRow() {
  const container = document.getElementById("api-headers");
  const row = document.createElement("div");
  row.className = "flex gap-2 header-row";
  row.innerHTML = `
    <input placeholder="Key" class="header-key flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs">
    <input placeholder="Value" class="header-val flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs">
    <button onclick="this.parentElement.remove()" class="text-slate-500 hover:text-red-400 text-xs px-1">x</button>`;
  container.appendChild(row);
}

async function sendRequest() {
  const method = document.getElementById("api-method").value;
  const url = document.getElementById("api-url").value;
  if (!url) return;
  const headers = {};
  document.querySelectorAll(".header-row").forEach((row) => {
    const k = row.querySelector(".header-key").value.trim();
    const v = row.querySelector(".header-val").value.trim();
    if (k) headers[k] = v;
  });
  let body = null;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const raw = document.getElementById("api-body").value.trim();
    if (raw) {
      try { body = JSON.parse(raw); } catch (_e) { body = raw; }
    }
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }
  const container = document.getElementById("api-response");
  container.innerHTML = '<p class="text-slate-500 text-sm">Sending...</p>';
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method, url, headers, body }),
  });
  const data = await res.json();
  if (data.error) {
    container.innerHTML = `<p class="text-red-400 text-sm">${data.error}</p>`;
    return;
  }
  const statusClass = data.status < 300 ? "status-2xx" : data.status < 400 ? "status-3xx" : "status-4xx";
  const bodyStr = typeof data.body === "object" ? JSON.stringify(data.body, null, 2) : String(data.body);
  container.innerHTML = `
    <div class="flex items-center gap-4 mb-3">
      <span class="font-bold ${statusClass}">${data.status} ${data.statusText}</span>
      <span class="text-xs text-slate-400">${data.time}ms</span>
    </div>
    <details class="mb-3"><summary class="text-xs text-slate-400 cursor-pointer">Response Headers</summary>
      <pre class="text-xs mt-1 bg-slate-900 p-2 rounded overflow-x-auto">${JSON.stringify(data.headers, null, 2)}</pre>
    </details>
    <pre class="text-sm bg-slate-900 p-3 rounded overflow-auto max-h-[60vh] font-mono">${escapeHtml(bodyStr)}</pre>`;
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- Terminal ---
function createTerminal() {
  const id = terminals.length;
  const term = new window.Terminal({
    cursorBlink: true,
    fontSize: 14,
    theme: { background: "#000000", foreground: "#e2e8f0" },
  });
  const fitAddon = new window.FitAddon.FitAddon();
  term.loadAddon(fitAddon);

  const container = document.createElement("div");
  container.id = "term-" + id;
  container.style.cssText = "width:100%;height:100%;display:none;";
  document.getElementById("terminal-panels").appendChild(container);

  term.open(container);

  const ws = new WebSocket(`ws://${location.host}/ws/terminal?id=${id}`);
  ws.onopen = () => {
    fitAddon.fit();
    ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
  };
  ws.onmessage = (e) => term.write(e.data);
  term.onData((data) => ws.send(JSON.stringify({ type: "input", data })));

  terminals.push({ id, term, ws, fitAddon, container });

  // Tab button
  const tabBtn = document.createElement("button");
  tabBtn.className = "px-3 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1";
  tabBtn.id = "term-tab-" + id;
  tabBtn.innerHTML = `Shell ${id + 1} <span onclick="event.stopPropagation();closeTerminal(${id})" class="ml-1 hover:text-red-400">x</span>`;
  tabBtn.onclick = () => switchTerminal(id);
  document.getElementById("term-tabs").appendChild(tabBtn);

  switchTerminal(id);

  window.addEventListener("resize", () => {
    if (activeTerminal === id) {
      fitAddon.fit();
      ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
    }
  });
}

function switchTerminal(id) {
  terminals.forEach((t) => { t.container.style.display = "none"; });
  document.querySelectorAll("[id^='term-tab-']").forEach((b) => b.classList.remove("ring-1", "ring-blue-500"));
  if (terminals[id]) {
    terminals[id].container.style.display = "block";
    activeTerminal = id;
    const btn = document.getElementById("term-tab-" + id);
    if (btn) btn.classList.add("ring-1", "ring-blue-500");
    setTimeout(() => terminals[id].fitAddon.fit(), 10);
  }
}

function closeTerminal(id) {
  if (terminals[id]) {
    terminals[id].ws.close();
    terminals[id].container.remove();
    const btn = document.getElementById("term-tab-" + id);
    if (btn) btn.remove();
    if (activeTerminal === id) {
      const remaining = terminals.filter((t, i) => i !== id && t.container.parentElement);
      if (remaining.length) switchTerminal(remaining[0].id);
    }
  }
}

// --- Init ---
require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs" } });
require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor-container"), {
    value: "// Open a file from the sidebar to start editing",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    padding: { top: 8 },
  });
  editorReady = true;

  // Ctrl+S / Cmd+S to save
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveFile);
});

initFileTree();
loadEnvDefaults();
