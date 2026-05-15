// ── State ─────────────────────────────────────────────────────────────────
const state = {
  user: null,
  avatarUrl: null,
  repos: [],
  currentRepo: null,
  activeTab: 'changes',
  activeFile: null,
};

// ── Utils ──────────────────────────────────────────────────────────────────
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${id}`).classList.add('active');
}

function toast(msg, type = 'success') {
  const icons = {
    success: `<svg viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>`,
    error:   `<svg viewBox="0 0 16 16"><path d="M4.47.22A.75.75 0 0 1 5 0h6a.75.75 0 0 1 .53.22l4.25 4.25c.141.14.22.331.22.53v6a.75.75 0 0 1-.22.53l-4.25 4.25A.75.75 0 0 1 11 16H5a.75.75 0 0 1-.53-.22L.22 11.53A.75.75 0 0 1 0 11V5a.75.75 0 0 1 .22-.53L4.47.22zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5H5.31zM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`,
  };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icons[type]}<span>${msg}</span>`;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function openModal(html) {
  const overlay = $('#modal-overlay');
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.classList.remove('hidden');
}

function closeModal() {
  $('#modal-overlay').classList.add('hidden');
  $('#modal-overlay').innerHTML = '';
}

// SVG icons
const icons = {
  hub:    `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
  book:   `<svg viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z"/></svg>`,
  lock:   `<svg viewBox="0 0 16 16"><path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 0 0-5 0v2Z"/></svg>`,
  branch: `<svg viewBox="0 0 16 16"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"/></svg>`,
  check:  `<svg viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/></svg>`,
  folder: `<svg viewBox="0 0 16 16"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`,
  edit:   `<svg viewBox="0 0 16 16"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064l6.286-6.286Z"/></svg>`,
  plus:   `<svg viewBox="0 0 16 16"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>`,
  minus:  `<svg viewBox="0 0 16 16"><path d="M2 7.75A.75.75 0 0 1 2.75 7h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 7.75Z"/></svg>`,
  warn:   `<svg viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>`,
  back:   `<svg viewBox="0 0 16 16"><path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"/></svg>`,
  cloud:  `<svg viewBox="0 0 16 16"><path d="M4.5 9.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5Zm2-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5ZM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2.5 8a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z"/></svg>`,
  globe:  `<svg viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5 11.13 11.13 0 0 1-1.832-5.5Zm-2.733-1.5h2.733a11.13 11.13 0 0 1 1.832-5.5 6.507 6.507 0 0 0-4.565 5.5Zm10.181 1.5a11.13 11.13 0 0 1-1.832 5.5 6.507 6.507 0 0 0 4.565-5.5Zm1.832-1.5a6.507 6.507 0 0 0-4.666-5.5 11.13 11.13 0 0 1 1.832 5.5Z"/></svg>`,
  trash:  `<svg viewBox="0 0 16 16"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/></svg>`,
  copy:   `<svg viewBox="0 0 16 16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>`,
  refresh:`<svg viewBox="0 0 16 16"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/></svg>`,
  logout: `<svg viewBox="0 0 16 16"><path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"/></svg>`,
  download:`<svg viewBox="0 0 16 16"><path d="M8 12a.75.75 0 0 1-.53-.22l-4.25-4.25a.75.75 0 0 1 1.06-1.06L8 10.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25A.75.75 0 0 1 8 12z"/><path d="M8 1.75a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 8 1.75zM1.75 13.5a.75.75 0 0 1 .75-.75h11a.75.75 0 0 1 0 1.5h-11a.75.75 0 0 1-.75-.75z"/></svg>`,
};

function icon(name) { return icons[name] || ''; }

// Language colors (GitHub style)
const langColors = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', Kotlin: '#A97BFF', 'C++': '#f34b7d', C: '#555555',
  'C#': '#178600', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
  PHP: '#4F5D95', Swift: '#F05138', Dart: '#00B4AB', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', Lua: '#000080', Vue: '#41b883',
  Scala: '#c22d40', Haskell: '#5e5086', R: '#198CE7', GLSL: '#5686a5',
};

function langBadge(lang) {
  if (!lang) return '';
  const color = langColors[lang] || '#8b949e';
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:${color}">
    <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>${lang}
  </span>`;
}

// Format relative date
function relativeDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff/2592000)}mo ago`;
  return `${Math.floor(diff/31536000)}y ago`;
}
function renderLogin() {
  $('#screen-login').innerHTML = `
    <div class="login-card">
      <img class="hub-icon" src="GitHub-logo.gif" alt="GitHub">
      <h1>GitHub</h1>
      <p>Sign in with your Personal Access Token</p>
      <div style="width:100%">
        <input id="token-input" class="input" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off">
        <div id="login-error" class="error-text"></div>
      </div>
      <div class="login-actions">
        <button class="btn" onclick="pywebview.api.open_in_browser('https://github.com/settings/tokens').then()">
          ${icon('globe')} Get token
        </button>
        <button class="btn primary" id="login-btn" onclick="doLogin()">
          Sign in
        </button>
      </div>
    </div>`;

  $('#token-input').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
}

async function doLogin() {
  const token = $('#token-input').value.trim();
  if (!token) { $('#login-error').textContent = 'Please enter a token'; return; }
  $('#login-btn').disabled = true;
  $('#login-btn').textContent = 'Signing in…';
  const res = await pywebview.api.login(token);
  if (res.ok) {
    state.user = res.user;
    state.avatarUrl = res.avatar_url || '';
    renderMain();
  } else {
    $('#login-error').textContent = res.error;
    $('#login-btn').disabled = false;
    $('#login-btn').innerHTML = 'Sign in';
  }
}

// ── MAIN SCREEN ────────────────────────────────────────────────────────────
function renderMain() {
  showScreen('main');
  const s = $('#screen-main');
  s.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="brand" onclick="pywebview.api.open_in_browser('https://github.com').then()">
          <img class="hub" src="GitHub-logo.gif" alt="GitHub">
          <span>GitHub</span>
        </div>
        <div class="actions">
          <span style="color:var(--accent);font-weight:600;font-size:12px;margin-right:6px">@${state.user}</span>
          <button class="icon-btn" title="Refresh" onclick="loadRepos()">${icon('refresh')}</button>
          <button class="icon-btn" title="Sign out" onclick="doLogout()">${icon('logout')}</button>
        </div>
      </div>
      <div class="sidebar-search">
        <input class="input" id="repo-search" placeholder="Filter repositories" oninput="filterRepos(this.value)">
      </div>
      <div class="repo-list" id="repo-list"></div>
      <div class="sidebar-status" id="sidebar-status">Loading…</div>
    </div>
    <div id="main-right" class="main-welcome">
      <img src="GitHub-logo.gif" alt="GitHub" style="width:120px;height:120px;margin-bottom:16px;opacity:0.85">
      <h2>Select a repository</h2>
      <p>Choose from the list on the left</p>
      <div class="welcome-actions">
        <button class="btn" onclick="showCloneDialog()">${icon('download')} Clone repository</button>
        <button class="btn primary" onclick="showCreateDialog()">${icon('plus')} New repository</button>
      </div>
    </div>`;

  // Load cached first, then fresh
  const cached = pywebview.api.get_cached_repos();
  if (cached && cached.length) renderRepoList(cached, true);
  loadRepos();
}

async function loadRepos() {
  const res = await pywebview.api.get_repos();
  if (res.ok) {
    state.repos = res.repos;
    renderRepoList(res.repos, false);
  } else {
    $('#sidebar-status').textContent = `Error: ${res.error}`;
  }
}

function renderRepoList(repos, cached) {
  state.repos = repos;
  const list = $('#repo-list');
  if (!list) return;
  const q = ($('#repo-search') || {}).value || '';
  const filtered = repos.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
  list.innerHTML = filtered.map((r, i) => `
    <div class="repo-item" onclick="openRepo(${i})" data-name="${r.name}">
      <span class="repo-icon" style="${r.private ? 'color:#d29922;filter:drop-shadow(0 0 4px #d2992266)' : 'color:var(--muted)'}">${r.private ? icon('lock') : icon('book')}</span>
      <div class="repo-info">
        <div class="repo-name">${r.name}</div>
        <div class="repo-desc" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          ${langBadge(r.language)}
          ${r.stargazers_count ? `<span style="color:var(--muted);font-size:11px">⭐ ${r.stargazers_count}</span>` : ''}
          ${r.updated_at ? `<span style="color:var(--muted);font-size:11px">${relativeDate(r.updated_at)}</span>` : ''}
        </div>
      </div>
    </div>`).join('');
  $('#sidebar-status').textContent = `${filtered.length} repositories${cached ? ' (cached)' : ''}`;
}

function filterRepos(q) {
  renderRepoList(state.repos, false);
}

async function doLogout() {
  await pywebview.api.logout();
  state.user = null;
  state.repos = [];
  renderLogin();
}

// ── REPO SCREEN ────────────────────────────────────────────────────────────
async function openRepo(idx) {
  const repo = state.repos[idx];
  if (!repo) return;
  state.currentRepo = repo;
  state.activeTab = 'changes';
  state.activeFile = null;
  showScreen('repo');
  renderRepoScreen(repo);

  // Try saved local path
  const saved = await pywebview.api.get_saved_repo_path(repo.name);
  if (saved) {
    const res = await pywebview.api.open_local_repo(saved);
    if (res.ok) {
      refreshChanges();
      refreshBranch();
      await pywebview.api.start_watcher();
    }
  }
}

function renderRepoScreen(repo) {
  const s = $('#screen-repo');
  s.innerHTML = `
    <div class="repo-toolbar">
      <div class="left">
        <button class="icon-btn" onclick="backToMain()" title="All repositories">${icon('back')}</button>
        <div class="toolbar-pill">
          ${icon('book')} <span class="muted">${state.user} /</span> <strong>${repo.name}</strong>
        </div>
        <div class="toolbar-pill" id="branch-pill" onclick="showBranchPicker()" style="cursor:pointer;user-select:none" title="Switch branch">
          ${icon('branch')} <span id="branch-name">${repo.default_branch || 'main'}</span>
          <span id="branch-ahead" class="ahead"></span>
          <span style="color:var(--muted);font-size:10px;margin-left:2px">▾</span>
        </div>
      </div>
      <div class="right">
        <button class="btn" id="fetch-btn" onclick="doFetch()"><span style="color:#58a6ff">${icon('cloud')}</span> Fetch origin</button>
        <button class="btn" onclick="showCloneDialog('${repo.clone_url}', '${repo.name}')"><span style="color:#a371f7">${icon('download')}</span> Clone</button>
        <button class="btn" onclick="pywebview.api.open_in_browser('${repo.html_url}').then()"><span style="color:#3fb950">${icon('globe')}</span> View on GitHub</button>
        <button class="btn" id="show-files-btn" onclick="doShowFiles()"><span style="color:#d29922">${icon('folder')}</span> Show in Files</button>
        <button class="btn danger" onclick="showDeleteDialog()"><span style="color:#f85149">${icon('trash')}</span> Delete repo</button>
      </div>
    </div>
    <div class="repo-body">
      <div class="changes-panel">
        <div class="panel-tabs">
          <div class="panel-tab active" id="tab-changes" onclick="switchTab('changes')">Changes</div>
          <div class="panel-tab" id="tab-history" onclick="switchTab('history')">History</div>
        </div>
        <div id="panel-content" style="flex:1;display:flex;flex-direction:column;overflow:hidden">
          <div class="changes-list" id="changes-list"></div>
        </div>
        <div class="commit-form">
          <div class="form-row">
            <div class="avatar">${state.avatarUrl
              ? `<img src="${state.avatarUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover">`
              : `<span>${(state.user||'?')[0].toUpperCase()}</span>`
            }</div>
            <div class="inputs">
              <input class="input" id="commit-summary" placeholder="Summary (required)">
              <input class="input" id="commit-desc" placeholder="Description (optional)">
            </div>
          </div>
          <div class="commit-error" id="commit-error"></div>
          <button class="btn primary commit-btn" id="commit-btn" onclick="doCommit()" disabled style="opacity:.45">
            ${icon('check')} Commit to ${repo.default_branch || 'main'}
          </button>
        </div>
      </div>
      <div class="diff-panel">
        <div class="diff-header" id="diff-header">Select a file to see the diff</div>
        <div class="diff-content" id="diff-content">
          <div class="diff-placeholder">Select a file from the list</div>
        </div>
      </div>
    </div>`;

  refreshChanges();
  refreshBranch();
}

async function backToMain() {
  await pywebview.api.stop_watcher();
  renderMain();
  showScreen('main');
}

function switchTab(tab) {
  state.activeTab = tab;
  $('#tab-changes').classList.toggle('active', tab === 'changes');
  $('#tab-history').classList.toggle('active', tab === 'history');
  if (tab === 'changes') {
    refreshChanges();
  } else {
    loadHistory();
  }
}

async function refreshChanges() {
  const res = await pywebview.api.get_changes();
  const list = $('#changes-list');
  if (!list) return;

  if (!res.ok) {
    list.innerHTML = `<div class="no-changes" style="flex-direction:column">
      <span style="color:var(--muted)">No local repository</span>
      <button class="btn" style="margin-top:8px" onclick="showOpenLocalDialog()">Open local folder…</button>
    </div>`;
    setCommitBtn(false);
    return;
  }

  const changes = res.changes;
  if (!changes.length) {
    list.innerHTML = `<div class="no-changes">${icon('check')}<span>No local changes</span></div>`;
    setCommitBtn(false);
    autoCommitMessage([]);
    return;
  }

  list.innerHTML = changes.map((c, i) => {
    const cls = c.code.includes('M') ? 'ci-M' : c.code === '??' || c.code.includes('A') ? 'ci-A' : c.code.includes('D') ? 'ci-D' : 'ci-dir';
    const ico = c.is_dir ? icon('folder') : c.code.includes('M') ? icon('edit') : c.code.includes('D') ? icon('minus') : icon('plus');
    return `<div class="change-item" onclick="selectFile(${i})" data-path="${c.path}" data-dir="${c.is_dir}">
      <span class="ci-icon ${cls}">${ico}</span>
      <span class="ci-path">${c.display}</span>
      <span class="ci-code ${cls}">${c.is_dir ? '' : c.code}</span>
    </div>`;
  }).join('');

  setCommitBtn(true);
  autoCommitMessage(changes);
}

function setCommitBtn(enabled) {
  const btn = $('#commit-btn');
  if (!btn) return;
  btn.disabled = !enabled;
  btn.style.opacity = enabled ? '1' : '.45';
}

function autoCommitMessage(changes) {
  const inp = $('#commit-summary');
  if (!inp || inp.value.trim()) return;
  if (!changes.length) return;
  if (changes.length === 1) {
    const c = changes[0];
    const name = c.display.replace(/\/$/, '').split('/').pop();
    const verb = c.code.includes('M') ? 'Update' : c.code.includes('D') ? 'Remove' : 'Add';
    inp.value = `${verb} ${name}`;
  } else {
    const mod = changes.filter(c => c.code.includes('M')).length;
    const add = changes.filter(c => c.code === '??' || c.code.includes('A')).length;
    const del = changes.filter(c => c.code.includes('D')).length;
    const parts = [];
    if (add) parts.push(`Add ${add} file${add>1?'s':''}`);
    if (mod) parts.push(`update ${mod} file${mod>1?'s':''}`);
    if (del) parts.push(`remove ${del} file${del>1?'s':''}`);
    inp.value = parts.join(', ');
  }
}

async function selectFile(idx) {
  $$('.change-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  const item = $$('.change-item')[idx];
  if (!item || item.dataset.dir === 'true') return;
  const path = item.dataset.path;
  $('#diff-header').textContent = path;
  const res = await pywebview.api.get_diff(path);
  renderDiff(res.diff || '');
}

function renderDiff(diff) {
  const el = $('#diff-content');
  if (!el) return;
  if (!diff) { el.innerHTML = '<div class="diff-placeholder">No diff available</div>'; return; }
  el.innerHTML = diff.split('\n').map(line => {
    let cls = '';
    if (line.startsWith('+') && !line.startsWith('+++')) cls = 'add';
    else if (line.startsWith('-') && !line.startsWith('---')) cls = 'del';
    else if (line.startsWith('@@')) cls = 'hunk';
    else if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) cls = 'meta';
    return `<span class="diff-line ${cls}">${escHtml(line) || ' '}</span>`;
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function showBranchPicker() {
  // Убираем существующий dropdown если есть
  const existing = $('#branch-dropdown');
  if (existing) { existing.remove(); return; }

  const branches = await pywebview.api.get_branches();
  if (!branches.length) { toast('No local repo open', 'error'); return; }
  const current = $('#branch-name')?.textContent?.trim() || '';

  const pill = $('#branch-pill');
  const rect = pill.getBoundingClientRect();

  const dropdown = document.createElement('div');
  dropdown.id = 'branch-dropdown';
  dropdown.style.cssText = `
    position:fixed; top:${rect.bottom + 4}px; left:${rect.left}px;
    background:var(--sidebar); border:2px solid var(--border); border-radius:8px;
    min-width:200px; max-height:280px; overflow-y:auto; z-index:500;
    box-shadow:0 8px 24px rgba(0,0,0,.4);
  `;
  dropdown.innerHTML = `
    <div style="padding:8px 10px;border-bottom:1px solid var(--border);font-size:11px;color:var(--muted)">Switch branch</div>
    ${branches.map(b => `
      <div onclick="doCheckout('${b}')" style="padding:9px 14px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:13px;${b===current?'color:var(--accent)':''}" onmouseover="this.style.background='var(--hover)'" onmouseout="this.style.background=''">
        <span style="color:var(--accent);width:14px">${b===current?'✓':''}</span>
        ${b}
      </div>`).join('')}`;

  document.body.appendChild(dropdown);

  // Закрываем при клике вне
  setTimeout(() => {
    document.addEventListener('click', function close(e) {
      if (!dropdown.contains(e.target) && e.target !== pill) {
        dropdown.remove();
        document.removeEventListener('click', close);
      }
    });
  }, 10);
}

async function doCheckout(branch) {
  closeModal();
  const res = await pywebview.api.checkout_branch(branch);
  if (res.ok) {
    refreshBranch();
    refreshChanges();
    toast(`✓ Switched to ${branch}`);
  } else {
    toast(`✗ ${res.error}`, 'error');
  }
}

async function loadHistory() {
  const commits = await pywebview.api.get_history();
  const panel = $('#panel-content');
  if (!panel) return;
  panel.innerHTML = `<div class="history-list">${
    commits.map(c => `
      <div class="history-item" data-sha="${c.sha}" onclick="showCommitDiff('${c.sha}')" style="cursor:pointer" onmouseover="this.style.background='var(--hover)'" onmouseout="this.style.background=''">
        <div class="hi-msg">${escHtml(c.message)}</div>
        <div class="hi-meta">${c.author} · <span style="color:var(--accent);font-family:monospace">${c.sha}</span> · ${c.date}</div>
      </div>`).join('') || '<div class="no-changes">No commits</div>'
  }</div>`;
}

async function showCommitDiff(sha) {
  $$('.history-item').forEach(el => el.style.borderLeft = '');
  // Найдём кликнутый элемент
  const items = $$('.history-item');
  items.forEach(el => {
    if (el.dataset.sha === sha) el.style.borderLeft = '2px solid var(--accent)';
  });
  $('#diff-header').textContent = `Commit ${sha} — loading…`;
  $('#diff-content').innerHTML = '<div class="diff-placeholder">Loading diff…</div>';

  // Запускаем в setTimeout чтобы не блокировать UI
  setTimeout(async () => {
    const res = await pywebview.api.get_commit_diff(sha);
    $('#diff-header').textContent = `Commit ${sha}`;
    renderDiff(res.diff || '');
  }, 10);
}

async function refreshBranch() {
  const info = await pywebview.api.get_branch_info();
  const el = $('#branch-name');
  // Если нет локального репо — показываем ветку из API
  if (el) el.textContent = info.branch || state.currentRepo?.default_branch || 'main';
  const ahead = $('#branch-ahead');
  if (ahead) {
    const parts = [];
    if (info.ahead) parts.push(`↑${info.ahead}`);
    if (info.behind) parts.push(`↓${info.behind}`);
    ahead.textContent = parts.join(' ');
  }
}

async function doCommit() {
  const msg = $('#commit-summary').value.trim();
  const desc = $('#commit-desc').value.trim();
  if (!msg) { $('#commit-error').textContent = 'Summary is required'; return; }
  $('#commit-error').textContent = '';
  setCommitBtn(false);
  const res = await pywebview.api.commit(msg, desc);
  if (res.ok) {
    $('#commit-summary').value = '';
    $('#commit-desc').value = '';
    refreshChanges();
    refreshBranch();
    $('#diff-content').innerHTML = '<div class="diff-placeholder">Select a file from the list</div>';
  } else {
    $('#commit-error').textContent = res.error;
    setCommitBtn(true);
  }
}

async function doFetch() {
  const btn = $('#fetch-btn');
  if (btn) { btn.textContent = 'Fetching…'; btn.disabled = true; }
  await pywebview.api.fetch();
}

async function doShowFiles() {
  const path = await pywebview.api.get_local_path();
  const res = await pywebview.api.open_in_files(path);
  if (!res.ok) toast('Open a local folder first', 'error');
}

// Callbacks from Python
function onPushSuccess() { toast('✓ Pushed to GitHub'); refreshBranch(); }
function onPushError(e) { toast(`✗ Push failed: ${e}`, 'error'); }
function onFetchSuccess() {
  const btn = $('#fetch-btn');
  if (btn) { btn.innerHTML = `${icon('cloud')} Fetch origin`; btn.disabled = false; }
  refreshBranch();
  toast('✓ Fetched');
}
function onFetchError(e) {
  const btn = $('#fetch-btn');
  if (btn) { btn.innerHTML = `${icon('cloud')} Fetch origin`; btn.disabled = false; }
  toast(`✗ Fetch failed: ${e}`, 'error');
}
function onFileChanged() { refreshChanges(); }
function onCloneSuccess(dest) { closeModal(); toast(`✓ Cloned to ${dest}`); }
function onCloneError(e) { toast(`✗ ${e}`, 'error'); const pb = $('.progress-bar'); if(pb) pb.classList.remove('visible'); }
function onCreateRepoSuccess(name) { toast(`✓ ${name} published to GitHub`); renderMain(); showScreen('main'); }
function onCreateRepoError(e) { toast(`✗ ${e}`, 'error'); }

// ── OPEN LOCAL DIALOG ──────────────────────────────────────────────────────
function showOpenLocalDialog() {
  const repo = state.currentRepo;
  openModal(`
    <div class="modal-header">Open local repository</div>
    <div class="modal-body">
      <p style="color:var(--muted);font-size:12px;margin-bottom:12px">Enter path to local clone. If it doesn't exist — it will be cloned.</p>
      <div class="field">
        <label>Local path</label>
        <input class="input" id="local-path-input" placeholder="/home/user/projects/${repo.name}" value="">
      </div>
      <div id="open-local-error" class="error-text"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="doOpenLocal()">Open / Clone</button>
    </div>`);
}

async function doOpenLocal() {
  const path = $('#local-path-input').value.trim();
  if (!path) { $('#open-local-error').textContent = 'Path is required'; return; }
  const repo = state.currentRepo;

  // Check if .git exists
  const res = await pywebview.api.open_local_repo(path);
  if (res.ok) {
    closeModal();
    refreshChanges();
    refreshBranch();
    await pywebview.api.start_watcher();
    return;
  }

  // Clone
  const dest = path.endsWith(repo.name) ? path : `${path}/${repo.name}`;
  closeModal();
  toast(`Cloning ${repo.name}…`);
  await pywebview.api.clone_repo(repo.clone_url, dest);
}

// ── CLONE DIALOG ───────────────────────────────────────────────────────────
async function showCloneDialog(repoUrl = '', repoName = '') {
  const lastPath = await pywebview.api.get_last_clone_path();
  openModal(`
    <div class="modal-header">Clone a repository</div>
    <div class="modal-body">
      <div class="field"><label>Repository URL</label>
        <input class="input" id="clone-url" placeholder="https://github.com/user/repo.git" value="${repoUrl}"></div>
      <div class="field"><label>Local path</label>
        <input class="input" id="clone-path" value="${repoName ? lastPath + '/' + repoName : lastPath}"></div>
      <div class="progress-bar" id="clone-progress"></div>
      <div id="clone-error" class="error-text"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="doClone()">Clone</button>
    </div>`);
}

async function doClone() {
  const url = $('#clone-url').value.trim();
  const path = $('#clone-path').value.trim();
  if (!url) { $('#clone-error').textContent = 'URL is required'; return; }
  if (!path) { $('#clone-error').textContent = 'Path is required'; return; }
  const name = url.split('/').pop().replace('.git', '');
  const dest = `${path.replace(/\/$/, '')}/${name}`;
  $('#clone-progress').classList.add('visible');
  await pywebview.api.clone_repo(url, dest);
}

// ── CREATE DIALOG ──────────────────────────────────────────────────────────
async function showCreateDialog() {
  const cfg = await pywebview.api.get_config();
  const lastPath = cfg.last_create_path || '~';
  const templates = await pywebview.api.get_gitignore_templates();
  crPathEdited = false;
  crBasePath = lastPath;  // сохраняем базовый путь

  openModal(`
    <div class="modal-header">Create a new repository</div>
    <div class="modal-body">
      <div class="field"><label>Name</label>
        <input class="input" id="cr-name" placeholder="repository-name" oninput="updateCreatePath()"></div>
      <div class="field"><label>Description</label>
        <input class="input" id="cr-desc" placeholder="(optional)"></div>
      <div class="field"><label>Local path</label>
        <input class="input" id="cr-path" value="${lastPath}" oninput="crPathEdited=true;crBasePath=$('#cr-path').value;updateCreatePath()">
        <div class="modal-path-hint" id="cr-path-hint"></div>
        <div class="git-warn" id="cr-git-warn">⚠ This folder already has a git repository. Existing commits will be pushed.</div>
      </div>
      <div class="field"><label>Initial branch</label>
        <input class="input" id="cr-branch" value="main"></div>
      <div class="field"><label>Git ignore</label>
        <select class="input" id="cr-gitignore">
          ${templates.map(t => `<option>${t}</option>`).join('')}
        </select>
      </div>
      <div class="toggle-row">
        <label class="toggle"><input type="checkbox" id="cr-readme" checked><span class="toggle-slider"></span></label>
        Initialize with README
      </div>
      <div class="toggle-row">
        <label class="toggle"><input type="checkbox" id="cr-private"><span class="toggle-slider"></span></label>
        Keep this code private
      </div>
      <div id="cr-error" class="error-text"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="doCreate()">Create repository</button>
    </div>`);
}

let crPathEdited = false;
let crBasePath = '';  // базовый путь который пользователь задал

function updateCreatePath() {
  const nameEl = $('#cr-name');
  const pathEl = $('#cr-path');
  const hint = $('#cr-path-hint');
  if (!nameEl || !pathEl) return;

  const name = nameEl.value.trim();

  // Если пользователь не трогал путь — автозаполняем на основе базового
  if (!crPathEdited) {
    pathEl.value = name ? `${crBasePath}/${name}` : crBasePath;
  }

  if (hint) hint.textContent = name && pathEl.value ? `Will be created at ${pathEl.value}` : '';
  self.page && self.page.update && self.page.update();
}

async function doCreate() {
  console.log('[doCreate] called');
  const name = $('#cr-name').value.trim();
  const path = $('#cr-path').value.trim();
  console.log('[doCreate] name=', name, 'path=', path);
  if (!name) { $('#cr-error').textContent = 'Name is required'; return; }
  if (!path) { $('#cr-error').textContent = 'Path is required'; return; }
  closeModal();
  crPathEdited = false;
  crBasePath = '';
  console.log('[doCreate] calling api...');
  const result = await pywebview.api.create_repo(
    name,
    $('#cr-desc') ? $('#cr-desc').value.trim() : '',
    $('#cr-private') ? $('#cr-private').checked : false,
    $('#cr-readme') ? $('#cr-readme').checked : true,
    $('#cr-gitignore') ? $('#cr-gitignore').value : 'None',
    $('#cr-branch') ? $('#cr-branch').value.trim() || 'main' : 'main',
    path
  );
  console.log('[doCreate] result=', JSON.stringify(result));
}

// ── DELETE DIALOG ──────────────────────────────────────────────────────────
function showDeleteDialog() {
  const repo = state.currentRepo;
  openModal(`
    <div class="modal-header">Delete repository</div>
    <div class="modal-body">
      <div class="warn-box">${icon('warn')}
        <div>This will permanently delete <strong>${state.user}/${repo.name}</strong>.<br>This action cannot be undone.</div>
      </div>
      <div class="field">
        <label>Type the repository name to confirm:</label>
        <div class="copy-row">
          <input class="input" id="delete-confirm" placeholder="Type '${repo.name}' to confirm" style="border-color:var(--red)">
          <button class="btn" onclick="pasteRepoName()" title="Paste name">${icon('copy')}</button>
        </div>
      </div>
      <div id="delete-error" class="error-text"></div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn danger" onclick="doDelete()">Delete permanently</button>
    </div>`);
}

function pasteRepoName() {
  const inp = $('#delete-confirm');
  if (inp) inp.value = state.currentRepo.name;
}

async function doDelete() {
  const val = $('#delete-confirm').value.trim();
  if (val !== state.currentRepo.name) {
    $('#delete-error').textContent = "Repository name doesn't match";
    return;
  }
  closeModal();
  const res = await pywebview.api.delete_repo(state.user, state.currentRepo.name);
  if (res.ok) {
    toast(`✓ Deleted ${state.currentRepo.name}`);
    await pywebview.api.stop_watcher();
    renderMain();
    showScreen('main');
  } else {
    toast(`✗ ${res.error}`, 'error');
  }
}

// ── INIT ───────────────────────────────────────────────────────────────────
window.addEventListener('pywebviewready', async () => {
  // Показываем экран загрузки пока проверяем токен
  $('#screen-login').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;height:100vh;background:var(--bg)">
      <img src="GitHub-logo.gif" style="width:80px;height:80px">
      <div style="color:var(--muted);font-size:13px">Loading…</div>
    </div>`;
  showScreen('login');

  const token = await pywebview.api.get_saved_token();
  if (token) {
    const res = await pywebview.api.login(token);
    if (res.ok) {
      state.user = res.user;
      state.avatarUrl = res.avatar_url || '';
      if (!state.avatarUrl) {
        const cfg = await pywebview.api.get_config();
        state.avatarUrl = cfg.avatar_url || '';
      }
      renderMain();
      return;
    }
  }
  // Токена нет или он невалидный — показываем логин
  renderLogin();
});
