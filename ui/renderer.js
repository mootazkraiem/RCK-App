"use strict";
window.addEventListener("error", (e) => { window.__lastError = (e.error && e.error.stack) || e.message; });
window.addEventListener("unhandledrejection", (e) => { window.__lastError = "unhandledrejection: " + (e.reason && e.reason.stack || e.reason); });

/* ============================== icons ============================== */
/* Small original line-icon set (not copied from any icon library) --
   plain SVG primitives, stroke=currentColor so CSS color classes apply. */
const SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const ICONS = {
  search: SVG_OPEN + '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  chevronDown: SVG_OPEN + '<path d="M6 9l6 6 6-6"/></svg>',
  info: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
  dots: SVG_OPEN + '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  checkDouble: SVG_OPEN + '<path d="M2 12.5l4 4L14 8"/><path d="M10 16.5l1 1L20 8"/></svg>',
  bell: SVG_OPEN + '<path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  help: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 1-1 2"/><circle cx="12" cy="16.7" r="0.6" fill="currentColor" stroke="none"/></svg>',
  send: SVG_OPEN + '<path d="M21 3 3 10.5l7 2.5 2 7L21 3Z"/><path d="M12.5 13.5 21 3"/></svg>',
  save: SVG_OPEN + '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h8V4"/><path d="M8 20v-6h8v6"/></svg>',
  docWhite: SVG_OPEN + '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="15.5" x2="15" y2="15.5"/></svg>',
  book: SVG_OPEN + '<path d="M4 4.5h6.5a2.5 2.5 0 0 1 2.5 2.5v13a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4.5h-6.5A2.5 2.5 0 0 0 11 7v13a2.5 2.5 0 0 1 2.5-2.5H20z"/></svg>',
  plus: SVG_OPEN + '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: SVG_OPEN + '<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  check: SVG_OPEN + '<path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  xMark: SVG_OPEN + '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
  externalLink: SVG_OPEN + '<path d="M9 6H5v13h13v-4"/><path d="M13 5h6v6"/><path d="M11 13 19 5"/></svg>',
  camera: SVG_OPEN + '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13.5" r="3.2"/></svg>',
  fileText: SVG_OPEN + '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="16.5" x2="15" y2="16.5"/></svg>',
  fileWarn: SVG_OPEN + '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><line x1="12" y1="11" x2="12" y2="15"/><circle cx="12" cy="17.6" r="0.6" fill="currentColor" stroke="none"/></svg>',
  arrowLeft: SVG_OPEN + '<line x1="19" y1="12" x2="5" y2="12"/><path d="M11 6l-6 6 6 6"/></svg>',
  folder: SVG_OPEN + '<path d="M4 6h6l2 2h8v11H4z"/></svg>',
  barChart: SVG_OPEN + '<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="18" y1="20" x2="18" y2="15"/></svg>',
  user: SVG_OPEN + '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/></svg>',
  globe: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3.5" y1="12" x2="20.5" y2="12"/></svg>',
  box: SVG_OPEN + '<path d="M4 7l8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7"/><line x1="12" y1="11" x2="12" y2="21"/></svg>',
  trash: SVG_OPEN + '<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 13h8l1-13"/><line x1="10" y1="10" x2="10" y2="17"/><line x1="14" y1="10" x2="14" y2="17"/></svg>',
  signOut: SVG_OPEN + '<path d="M9 4H5v16h4"/><path d="M15 8l4 4-4 4"/><line x1="19" y1="12" x2="9" y2="12"/></svg>',
  grid: SVG_OPEN + '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  inbox: SVG_OPEN + '<path d="M4 6h6l2 2h8v11H4z"/></svg>',
  shieldCheck: SVG_OPEN + '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12.2l2 2 4-4.4"/></svg>',
  clipboardCheck: SVG_OPEN + '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 12.2l2 2 4-4.4"/></svg>',
  sparkles: SVG_OPEN + '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 3.5v3M17.5 5h3" stroke-width="1.6"/></svg>',
  lock: SVG_OPEN + '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>',
  settings: SVG_OPEN + '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>',
  clock: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  arrowRight: SVG_OPEN + '<line x1="5" y1="12" x2="19" y2="12"/><path d="M13 6l6 6-6 6"/></svg>',
  wrench: SVG_OPEN + '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2.6-2.6a1 1 0 0 1 0-1.4l6.3-6.3"/><path d="M14.7 6.3 13 4.6a4 4 0 0 0-5.3 5.3L3 14.6 5.4 17l4.7-4.7"/></svg>',
  listOrdered: SVG_OPEN + '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
};
function iconSvg(name){ return ICONS[name] || ICONS.folder; }
function setIcon(id, name, extraClass){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = iconSvg(name);
  if(extraClass) el.classList.add(extraClass);
}

const APP_ICON_RULES = [
  [/valid/i, "barChart"],
  [/workflow|approv|manager/i, "user"],
  [/portal|web|release/i, "globe"],
  [/cad|exchange|data/i, "box"],
  [/pdm/i, "folder"],
];
function appIconName(appName){
  for(const [re, icon] of APP_ICON_RULES){
    if(re.test(appName)) return icon;
  }
  return "folder";
}

/* ============================== state ============================== */
let allApps = [];
let currentApps = [];       // capture-form selected applications
let currentInfoApps = [];   // information-form selected applications
let currentProcApps = [];   // procedure-form selected applications
let stagedAttachments = []; // capture-form: [{kind, path, name}] not yet saved
let currentDetailIssue = null;
let editApps = [];          // edit-dialog selected applications
let infoAppsPicker = null;
let procAppsPicker = null;
let currentRole = "technician";  // "technician" | "admin" | "super_admin" -- server enforces the real check
let currentUsername = null;
let currentDisplayName = null;
let _searchSeq = 0;              // guards against a slow, stale search response overwriting a newer one
let _notifPollId = null;         // setInterval handle for live notification polling, cleared on logout
function isAdminOrAbove(){ return currentRole === "admin" || currentRole === "super_admin"; }

const NEW_APP_SENTINEL = "__new__";

/* ============================== helpers ============================== */
function escapeHtml(s){
  const d = document.createElement("div");
  d.innerText = s == null ? "" : s;
  return d.innerHTML;
}
function escapeAttr(s){ return String(s == null ? "" : s).replace(/"/g,"&quot;"); }
function basename(p){ return String(p || "").split(/[\\/]/).pop(); }

function statusClass(s){ return {review:"st-review",in_progress:"st-inprogress",critical:"st-critical",cancelled:"st-cancelled",solved:"st-solved"}[s] || "st-review"; }
function borderClass(s){ return {review:"b-review",in_progress:"b-inprogress",critical:"b-critical",cancelled:"b-cancelled",solved:"b-solved"}[s] || "b-review"; }
function statusLabel(s){ return {review:"REVIEW",in_progress:"IN PROGRESS",critical:"CRITICAL",cancelled:"CANCELLED",solved:"SOLVED"}[s] || String(s).toUpperCase(); }
function typeBadgeInfo(t){
  return { PROBLEM_SOLUTION: { icon: "edit", glyph: "!", glyphClass: "type-glyph-ps", label: "Problem / Solution" },
    INFORMATION: { icon: "info", glyph: "?", glyphClass: "type-glyph-info", label: "Information" },
    PROCEDURE: { icon: "listOrdered", glyph: "→", glyphClass: "type-glyph-proc", label: "Procedure" }
  }[t] || { icon: "edit", glyph: "!", glyphClass: "type-glyph-ps", label: "Problem / Solution" };
}
function typeGlyphHtml(t, extraClass){
  const m = typeBadgeInfo(t);
  return `<span class="type-glyph ${m.glyphClass}${extraClass ? " " + extraClass : ""}">${m.glyph}</span>`;
}
function formatDate(iso){
  if(!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString();
}

function api(){ return window.pywebview.api; }
function whenReady(fn){
  if (window.pywebview && window.pywebview.api) { fn(); return; }
  let started = false;
  const start = () => { if(started) return; started = true; fn(); };
  window.addEventListener("pywebviewready", start, { once: true });
  // Fallback: pywebviewready doesn't fire reliably on every pywebview
  // version/platform -- without this, a missed event means init() never
  // runs and the whole app hangs forever with no error, indistinguishable
  // from a freeze. Poll as a safety net so it always eventually starts.
  const pollId = setInterval(() => {
    if (window.pywebview && window.pywebview.api) {
      clearInterval(pollId);
      start();
    }
  }, 100);
}

/* ========================= applications picker ========================= */
/* Reusable chips + dropdown widget used by both the capture form and the
   issue-edit dialog. Backed by a plain array the caller owns. */
function createAppsPicker({ pickerEl, chipsEl, toggleEl, dropdownEl, getSelected, onChange }){
  function close(){
    pickerEl.classList.remove("open");
    dropdownEl.classList.remove("open");
  }
  function open(){
    renderDropdown();
    pickerEl.classList.add("open");
    dropdownEl.classList.add("open");
  }
  function toggle(e){
    e.stopPropagation();
    if(dropdownEl.classList.contains("open")) close(); else open();
  }
  function renderChips(){
    const selected = getSelected();
    chipsEl.innerHTML = selected.map(a => `
      <span class="chip">${escapeHtml(a)} <button type="button" data-app="${escapeAttr(a)}">×</button></span>
    `).join("");
    chipsEl.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = btn.getAttribute("data-app");
        onChange(selected.filter(a => a !== name));
        renderChips();
      });
    });
  }
  function renderDropdown(){
    const selected = getSelected();
    dropdownEl.innerHTML = allApps.map(a => `
      <div class="apps-dropdown-item${selected.includes(a) ? " selected" : ""}" data-app="${escapeAttr(a)}">
        <span class="icon icon-muted icon-sm">${iconSvg(appIconName(a))}</span>
        <span class="apps-dropdown-label">${escapeHtml(a)}</span>
        <button type="button" class="apps-dropdown-delete" data-del="${escapeAttr(a)}" title="Remove ${escapeAttr(a)} from the application list">${iconSvg("trash")}</button>
      </div>
    `).join("") + `
      <div class="apps-dropdown-item apps-dropdown-new" data-new="1">
        <span class="icon icon-primary icon-sm">${iconSvg("plus")}</span>New application…
      </div>
    `;
    dropdownEl.querySelectorAll(".apps-dropdown-item[data-app]").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = item.getAttribute("data-app");
        const sel = getSelected();
        const next = sel.includes(name) ? sel.filter(a => a !== name) : sel.concat([name]);
        onChange(next);
        renderChips();
        renderDropdown();
      });
    });
    dropdownEl.querySelectorAll(".apps-dropdown-delete").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteApplication(btn.getAttribute("data-del"));
      });
    });
    const newItem = dropdownEl.querySelector(".apps-dropdown-new");
    newItem.addEventListener("click", async (e) => {
      e.stopPropagation();
      close();
      const name = await openAddAppModal();
      if(name){
        const sel = getSelected();
        if(!sel.includes(name)) onChange(sel.concat([name]));
        renderChips();
      }
    });
  }
  toggleEl.addEventListener("click", toggle);
  pickerEl.addEventListener("click", (e) => { if(e.target === pickerEl || e.target === chipsEl) open(); });
  document.addEventListener("click", (e) => { if(!pickerEl.contains(e.target)) close(); });
  renderChips();
  return { renderChips, renderDropdown, close };
}

let mainAppsPicker = null;
let editAppsPicker = null;

function refreshAllAppWidgets(){
  if(mainAppsPicker) mainAppsPicker.renderDropdown();
  if(editAppsPicker) editAppsPicker.renderDropdown();
  document.querySelectorAll(".stepApp").forEach(populateStepAppSelect);
}

async function deleteApplication(name){
  const result = await api().delete_application(name);
  if(result && result.apiError){ alert(result.apiError); return; }
  allApps = result;

  currentApps = currentApps.filter(a => a !== name);
  editApps = editApps.filter(a => a !== name);
  if(mainAppsPicker) mainAppsPicker.renderChips();
  if(editAppsPicker) editAppsPicker.renderChips();
  document.querySelectorAll(".stepApp").forEach(sel => { if(sel.value === name) sel.value = ""; });

  refreshAllAppWidgets();
}

/* ============================== steps ============================== */
function populateStepAppSelect(select){
  const current = select.value;
  select.innerHTML = '<option value="">App…</option>' +
    allApps.map(a => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("") +
    `<option value="${NEW_APP_SENTINEL}">+ New application…</option>`;
  select.value = current;
}
function updateStepAppIcon(row){
  const select = row.querySelector(".stepApp");
  const iconEl = row.querySelector(".step-app-icon");
  iconEl.innerHTML = iconSvg(select.value ? appIconName(select.value) : "folder");
}
function addStep(container, action, appVal){
  const row = document.createElement("div");
  row.className = "step-row";
  row.innerHTML = `
    <div class="step-num"></div>
    <input type="text" class="stepAction" placeholder="Describe this step" value="${escapeAttr(action || "")}">
    <div class="step-app-select">
      <span class="icon step-app-icon"></span>
      <select class="stepApp"></select>
    </div>
    <button type="button" class="del-step">✕</button>
  `;
  container.appendChild(row);
  const select = row.querySelector(".stepApp");
  populateStepAppSelect(select);
  if(appVal) select.value = appVal;
  updateStepAppIcon(row);
  select.addEventListener("change", async () => {
    if(select.value === NEW_APP_SENTINEL){
      const name = await openAddAppModal();
      select.value = "";
      if(name){
        if(!allApps.includes(name)) { /* addApp already updates allApps globally */ }
        populateStepAppSelect(select);
        select.value = name;
      }
    }
    updateStepAppIcon(row);
  });
  row.querySelector(".del-step").addEventListener("click", () => {
    row.remove();
    renumberSteps(container);
  });
  renumberSteps(container);
}
function renumberSteps(container){
  const rows = container.querySelectorAll(".step-row");
  rows.forEach((r, i) => { r.querySelector(".step-num").textContent = i + 1; });
}
function collectSteps(container){
  return Array.from(container.querySelectorAll(".step-row")).map(r => [
    r.querySelector(".stepAction").value.trim(),
    r.querySelector(".stepApp").value === NEW_APP_SENTINEL ? "" : r.querySelector(".stepApp").value,
  ]).filter(s => s[0]);
}
function clearSteps(container){ container.innerHTML = ""; }

/* ============================== attachments ============================== */
const KIND_ICON = { screenshot: "camera", log: "fileText", error: "fileWarn" };
const KIND_LABEL = { screenshot: "Screenshot", log: "Log", error: "Error Report" };

function renderStagedAttachments(){
  const box = document.getElementById("stagedAttachments");
  box.innerHTML = stagedAttachments.map((a, idx) => `
    <div class="attachment-item">
      <span class="icon icon-muted icon-sm">${iconSvg(KIND_ICON[a.kind] || "fileText")}</span>
      <span class="name">${escapeHtml(a.name)}</span>
      <span class="kind-tag">${KIND_LABEL[a.kind] || a.kind}</span>
      <button type="button" data-idx="${idx}">✕</button>
    </div>
  `).join("");
  box.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      stagedAttachments.splice(Number(btn.getAttribute("data-idx")), 1);
      renderStagedAttachments();
    });
  });
}
async function stageAttachment(kind){
  const path = await api().pick_file();
  if(!path) return;
  stagedAttachments.push({ kind, path, name: basename(path) });
  renderStagedAttachments();
}

function renderAttachmentList(container, attachments, issueId, removable){
  if(!attachments || attachments.length === 0){
    container.innerHTML = '<div class="hint">No attachments.</div>';
    return;
  }
  container.innerHTML = attachments.map(a => `
    <div class="attachment-item">
      <span class="icon icon-muted icon-sm">${iconSvg(KIND_ICON[a.kind] || "fileText")}</span>
      <span class="name" data-name="${escapeAttr(a.name)}">${escapeHtml(a.name)}</span>
      <span class="kind-tag">${KIND_LABEL[a.kind] || a.kind}</span>
      ${removable ? `<button type="button" data-name="${escapeAttr(a.name)}">✕</button>` : ""}
    </div>
  `).join("");
  container.querySelectorAll(".name").forEach(el => {
    el.addEventListener("click", () => api().open_attachment(issueId, el.getAttribute("data-name")));
  });
  if(removable){
    container.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", async () => {
        const result = await api().remove_attachment(issueId, btn.getAttribute("data-name"));
        if(result && !result.apiError){
          currentDetailIssue = result;
          renderAttachmentList(container, result.attachments, issueId, true);
        }
      });
    });
  }
}

/* ============================== issue list ============================== */
async function renderList(query){
  const list = document.getElementById("issueList");
  const mySeq = ++_searchSeq;
  const items = (query && query.trim())
    ? await api().search_issues(query)
    : await api().list_issues();
  if(mySeq !== _searchSeq) return []; // a newer keystroke's request has already superseded this one
  if(items && items.apiError){
    if(items.needsLogin) showLoginScreen(items.apiError);
    renderIssueCards(list, [], items.apiError);
    return [];
  }
  const shown = items.slice().reverse().slice(0, 8);
  renderIssueCards(list, shown, "No matching issues.");
  return items;
}
function waitingSince(iso){
  const ms = Date.now() - new Date(iso).getTime();
  if(!(ms >= 0)) return "Just now";
  const hours = ms / 36e5;
  if(hours < 1) return "Just now";
  if(hours < 24) return `Waiting ${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `Waiting ${days} day${days === 1 ? "" : "s"}`;
}
/* variant "review": compact row for a queue waiting on a decision (icon,
   title, author, how long it's been waiting, a Review action) -- matches
   the RCK review-row pattern. variant "status" (default): same row shape
   but a plain status pill on the right, for lists that aren't a to-do
   (Trusted knowledge, My recent submissions, Recent Issues sidebar). */
function renderIssueCards(container, items, emptyText, variant){
  if(items.length === 0){
    container.innerHTML = `<div class="hint" style="padding:10px 0;">${emptyText}</div>`;
    return;
  }
  container.innerHTML = items.map(i => {
    const right = variant === "review"
      ? `<span class="row-waiting">${waitingSince(i.createdAt)}</span>
         <button type="button" class="row-review-link" data-open="${escapeAttr(i.id)}">Review <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button>`
      : `<span class="status ${statusClass(i.status)}">${statusLabel(i.status)}</span>`;
    const tMeta = typeBadgeInfo(i.type);
    return `
    <div class="issue-row" data-id="${escapeAttr(i.id)}">
      ${typeGlyphHtml(i.type, "row-icon")}
      <div class="row-body">
        <div class="row-title-line"><span class="row-title">${escapeHtml(i.title)}</span><span class="notif-pill ${tMeta.label === "Information" ? "notif-pill-indigo" : tMeta.label === "Procedure" ? "notif-pill-green" : "notif-pill-blue"}">${tMeta.label}</span></div>
        <div class="row-sub">${escapeHtml(i.createdBy || "—")} · ${i.createdAt ? formatDate(i.createdAt) : "—"}</div>
      </div>
      <div class="row-right">${right}</div>
    </div>`;
  }).join("");
  container.querySelectorAll(".issue-row").forEach(el => {
    el.addEventListener("click", () => openDetail(el.getAttribute("data-id")));
  });
}
async function openViewAll(){
  const items = await api().list_issues();
  renderIssueCards(document.getElementById("viewAllBody"), items.slice().reverse(), "No issues yet.");
  openOverlay("viewAllOverlay");
}

/* ============================== overlays ============================== */
function openOverlay(id){ const el = document.getElementById(id); if(el) el.classList.add("open"); }
function closeOverlay(id){ const el = document.getElementById(id); if(el) el.classList.remove("open"); }
function topOpenOverlay(){
  const open = Array.from(document.querySelectorAll(".modal-overlay.open"));
  return open.length ? open[open.length - 1] : null;
}

/* ============================== generic confirm dialog ============================== */
let _confirmResolve = null;
function confirmDialog({ icon = "info", iconClass = "neutral", title, text, actionLabel = "Confirm", actionClass = "btn-primary" }){
  document.getElementById("confirmIcon").innerHTML = iconSvg(icon);
  document.getElementById("confirmIcon").className = `confirm-icon confirm-icon-${iconClass}`;
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmText").textContent = text;
  const actionBtn = document.getElementById("confirmActionBtn");
  actionBtn.textContent = actionLabel;
  actionBtn.className = `btn ${actionClass}`;
  openOverlay("confirmOverlay");
  return new Promise(resolve => { _confirmResolve = resolve; });
}
function _closeConfirmDialog(result){
  closeOverlay("confirmOverlay");
  const r = _confirmResolve; _confirmResolve = null;
  if(r) r(result);
}

/* ============================== add application ============================== */
let _addAppResolve = null;
function openAddAppModalUI(){
  document.getElementById("newAppInput").value = "";
  openOverlay("addAppOverlay");
  setTimeout(() => document.getElementById("newAppInput").focus(), 0);
  return new Promise(resolve => { _addAppResolve = resolve; });
}
async function confirmAddApp(){
  const name = document.getElementById("newAppInput").value.trim();
  closeOverlay("addAppOverlay");
  if(_addAppResolve){ _addAppResolve(name || null); _addAppResolve = null; }
}
function cancelAddApp(){
  closeOverlay("addAppOverlay");
  if(_addAppResolve){ _addAppResolve(null); _addAppResolve = null; }
}

/* ============================== manage users ============================== */
function roleLabel(r){ return {technician:"Contributor",admin:"Reviewer",super_admin:"Administrator"}[r] || r; }
function creatableRoles(){
  // A super admin can create admins or technicians; an admin can only
  // create technicians. Creating another super_admin is never exposed
  // here -- that stays a server-CLI-only bootstrap action.
  return currentRole === "super_admin" ? [["technician","Contributor"],["admin","Reviewer"]] : [["technician","Contributor"]];
}

async function openManageUsers(){
  document.getElementById("nuError").style.display = "none";
  document.getElementById("nuUsername").value = "";
  document.getElementById("nuDisplayName").value = "";
  document.getElementById("nuPassword").value = "";
  document.getElementById("nuRole").innerHTML = creatableRoles().map(([v,l]) => `<option value="${v}">${l}</option>`).join("");
  await refreshUserList();
  await refreshPasswordRequests();
}

/* ============================== notifications ============================== */
/* Two kinds, like Teams/Facebook: pending password requests are a to-do
   that persists (badge-worthy) until actually resolved via Approve/Reject
   -- not just "seen". New issues a teammate posted, your own request
   getting resolved, and direct events (e.g. an admin changed your issue's
   status) are FYI -- the server only ever returns ones newer than your
   last-seen timestamp, so anything present here is by definition unread;
   opening the popover marks them seen server-side.

   Popups (toasts) fire the moment a poll notices something genuinely new
   -- same idea as Teams/FB. Sound is intentionally not wired up yet. */
let _lastNotifications = { pending: [], newIssues: [], resolvedRequests: [], direct: [] };
let _toastedKeys = new Set();   // dedup so the same item doesn't toast on every 30s poll
let _notifsInitialized = false; // don't toast-flood everything already sitting there on first load

function showToast(title, body, onClick){
  const container = document.getElementById("toastContainer");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<b>${escapeHtml(title)}</b><div class="toast-body">${escapeHtml(body)}</div>`;
  if(onClick) el.addEventListener("click", onClick);
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast-out");
    setTimeout(() => el.remove(), 200);
  }, 6000);
}

function toastNewItems(items, keyPrefix, keyFn, titleFn, bodyFn, onClick){
  items.forEach(item => {
    const key = `${keyPrefix}:${keyFn(item)}`;
    if(_toastedKeys.has(key)) return;
    _toastedKeys.add(key);
    showToast(titleFn(item), bodyFn(item), onClick ? () => onClick(item) : null);
  });
}


/* Read/unread state is local per user (localStorage), keyed by a stable item key. */
function _readStoreKey(){ return "rck.notifRead." + (currentUsername || "anon"); }
function _loadReadSet(){
  try { return new Set(JSON.parse(localStorage.getItem(_readStoreKey()) || "[]")); } catch(e){ return new Set(); }
}
function _saveReadSet(set){
  try { localStorage.setItem(_readStoreKey(), JSON.stringify(Array.from(set).slice(-500))); } catch(e){}
}
function notifKey(item){ return `${item.cat}|${item.title}|${item.time}|${item.body}`; }
function isNotifRead(item){ return _loadReadSet().has(notifKey(item)); }
function setNotifRead(items, read){
  const set = _loadReadSet();
  items.forEach(i => read ? set.add(notifKey(i)) : set.delete(notifKey(i)));
  _saveReadSet(set);
}
function _delStoreKey(){ return "rck.notifDeleted." + (currentUsername || "anon"); }
function _loadDeletedSet(){
  try { return new Set(JSON.parse(localStorage.getItem(_delStoreKey()) || "[]")); } catch(e){ return new Set(); }
}
function deleteNotif(item){
  const set = _loadDeletedSet(); set.add(notifKey(item));
  try { localStorage.setItem(_delStoreKey(), JSON.stringify(Array.from(set).slice(-500))); } catch(e){}
}
function unreadNotifCount(){ return buildNotifItems("all").filter(i => !isNotifRead(i)).length; }
function notifMeta(iso){
  const d = new Date(iso);
  if(isNaN(d)) return "";
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const bucket = dayBucketLabel(iso);
  if(bucket === "Today" || bucket === "Yesterday") return `${time} · ${bucket}`;
  return `${d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}

async function refreshNotifications(){
  const badge = document.getElementById("notifBadge");
  const data = await api().get_notifications();
  if(!data || data.apiError){
    badge.style.display = "none";
    return;
  }
  _lastNotifications = {
    pending: data.pendingPasswordRequests || [],
    newIssues: data.newIssues || [],
    resolvedRequests: data.myResolvedRequests || [],
    direct: data.direct || [],
  };
  const seenNow = buildNotifItems("all");
  const fresh = seenNow.filter(i => { const k = notifKey(i); if(_toastedKeys.has(k)) return false; _toastedKeys.add(k); return true; });
  if(_notifsInitialized) handleFreshNotifications(fresh.filter(i => !isNotifRead(i)));
  _notifsInitialized = true;
  refreshNotifBadgesOnly();
}

function notifRowClick(item, closeFn){
  setNotifRead([item], true);
  if(closeFn) closeFn();
  if(item.onClick) item.onClick();
  refreshNotifBadgesOnly();
}
function refreshNotifBadgesOnly(){
  const total = unreadNotifCount();
  const badge = document.getElementById("notifBadge");
  if(badge){ badge.style.display = total ? "" : "none"; badge.textContent = total > 9 ? "9+" : String(total); }
  const sideBadge = document.getElementById("sideBadgeNotif");
  if(sideBadge){ sideBadge.hidden = total === 0; sideBadge.textContent = total > 9 ? "9+" : String(total); }
}
function renderNotificationPopover(containerId, category){
  const bare = containerId === "dashNotifList";
  const pop = document.getElementById(containerId || "notifPopover");
  const cat = category || "all";
  const items = buildNotifItems(cat).slice(0, 5);
  const unread = items.filter(i => !isNotifRead(i)).length;

  if(!items.length){
    pop.innerHTML = `
      ${bare ? "" : `<div class="popover-header"><h4>Notifications</h4></div>`}
      <div class="notif-empty">
        <span class="notif-empty-icon">${iconSvg("bell")}</span>
        <div class="notif-empty-title">You're all caught up</div>
        <div class="muted-small">New reviews and updates on your entries will appear here.</div>
      </div>
      ${bare ? "" : `<div class="notif-pop-foot"><button type="button" class="notif-pop-viewall" data-view="notifications"><span>View all notifications <span class="icon icon-sm" data-nav-icon="arrowRight"></span></span></button></div>`}`;
  } else {
    pop.innerHTML = `
      ${bare ? "" : `<div class="popover-header">
        <div class="popover-title"><h4>Notifications</h4>${unread ? `<span class="notif-unread-pill">${unread} unread</span>` : ""}</div>
        <button type="button" class="notif-markall" data-pop-markall><span class="icon icon-sm">${iconSvg("checkDouble")}</span> Mark all as read</button>
      </div>`}
      <div class="notif-pop-list">
        ${items.map((item, idx) => {
          const read = isNotifRead(item);
          return `
        <button type="button" class="notif-pop-item${read ? "" : " unread"}" data-notif-idx="${idx}">
          <span class="notif-icon notif-icon-${item.colorClass}">${iconSvg(item.icon)}</span>
          <span class="notif-pop-body">
            <span class="notif-pop-title">${escapeHtml(item.title)}</span>
            <span class="notif-pop-text">${item.body}</span>
            <span class="notif-time">${notifMeta(item.time)}</span>
          </span>
          ${read ? "" : `<span class="notif-dot" aria-label="Unread"></span>`}
        </button>`;
        }).join("")}
      </div>
      ${bare ? "" : `<div class="notif-pop-foot"><button type="button" class="notif-pop-viewall" data-view="notifications"><span>View all notifications <span class="icon icon-sm" data-nav-icon="arrowRight"></span></span></button><span class="icon notif-pop-gear" title="Notification preferences">${iconSvg("settings")}</span></div>`}`;
  }
  const close = () => pop.classList.remove("open");
  pop.querySelectorAll("[data-notif-idx]").forEach(btn => {
    const item = items[Number(btn.getAttribute("data-notif-idx"))];
    btn.addEventListener("click", () => { close(); openNotificationDetail(item); });
  });
  const viewAllBtn = pop.querySelector(".notif-pop-viewall");
  if(viewAllBtn) viewAllBtn.addEventListener("click", () => { close(); showView("notifications"); });
  const gear = pop.querySelector(".notif-pop-gear");
  if(gear){ gear.style.cursor = "pointer"; gear.addEventListener("click", () => { close(); showView("my-account"); setAccountTab("notifications"); }); }
  const markAll = pop.querySelector("[data-pop-markall]");
  if(markAll) markAll.addEventListener("click", e => { e.stopPropagation(); setNotifRead(buildNotifItems("all"), true); refreshNotifBadgesOnly(); renderNotificationPopover(containerId, category); });
  pop.querySelectorAll("[data-nav-icon]").forEach(el => { el.innerHTML = iconSvg(el.dataset.navIcon); });
}

async function refreshPasswordRequests(){
  const body = document.getElementById("pwRequestListBody");
  const requests = await api().list_password_requests();
  if(requests && requests.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(requests.apiError); return; }
  if(requests && requests.apiError){ body.innerHTML = `<div class="user-row">${escapeHtml(requests.apiError)}</div>`; return; }
  if(!requests.length){ body.innerHTML = `<div class="user-row muted-small">No pending requests.</div>`; return; }
  body.innerHTML = requests.map(r => `
      <div class="req-row">
        <span class="notif-icon notif-icon-tile notif-icon-indigo">${iconSvg("user")}</span>
        <div class="req-main">
          <div class="req-title-line"><b class="req-name">${escapeHtml(r.username)}</b><span class="notif-pill notif-pill-indigo">Password change</span></div>
          <div class="req-meta"><span class="icon icon-sm">${iconSvg("clock")}</span>Requested ${formatDate(r.requested_at)}</div>
        </div>
        <div class="req-actions">
          <button type="button" class="req-btn req-btn-reject" data-reject="${r.id}">Reject</button>
          <button type="button" class="req-btn req-btn-approve" data-approve="${r.id}">Approve</button>
        </div>
      </div>`).join("");
  body.querySelectorAll("[data-approve]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const result = await api().approve_password_request(btn.getAttribute("data-approve"));
      if(result && result.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(result.apiError); return; }
      if(result && result.apiError){ alert(result.apiError); return; }
      await refreshPasswordRequests();
      await refreshNotifications();
    });
  });
  body.querySelectorAll("[data-reject]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const result = await api().reject_password_request(btn.getAttribute("data-reject"));
      if(result && result.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(result.apiError); return; }
      if(result && result.apiError){ alert(result.apiError); return; }
      await refreshPasswordRequests();
      await refreshNotifications();
    });
  });
}

async function submitPasswordChangeRequest(){
  const newPassword = document.getElementById("cpNewPassword").value;
  const confirmPassword = document.getElementById("cpConfirmPassword").value;
  const errEl = document.getElementById("cpError");
  const okEl = document.getElementById("cpSuccess");
  okEl.style.display = "none";
  if(!newPassword || newPassword.length < 8){
    errEl.textContent = "Password must be at least 8 characters.";
    errEl.style.display = "";
    return;
  }
  if(newPassword !== confirmPassword){
    errEl.textContent = "Passwords do not match.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("cpRequestBtn");
  btn.disabled = true;
  const result = await api().request_password_change(newPassword);
  btn.disabled = false;
  if(result && result.needsLogin){ closeOverlay("helpOverlay"); showLoginScreen(result.apiError); return; }
  if(result && result.apiError){
    errEl.textContent = result.apiError;
    errEl.style.display = "";
    return;
  }
  errEl.style.display = "none";
  document.getElementById("cpNewPassword").value = "";
  document.getElementById("cpConfirmPassword").value = "";
  okEl.textContent = "Request submitted. An admin needs to approve it before it takes effect.";
  okEl.style.display = "";
}

let _usersCache = [];
async function refreshUserList(){
  const body = document.getElementById("userListBody");
  const users = await api().list_users();
  if(users && users.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(users.apiError); return; }
  if(users && users.apiError){ body.innerHTML = `<tr><td colspan="4">${escapeHtml(users.apiError)}</td></tr>`; return; }
  _usersCache = users;

  const countLabel = n => `${n} ${n === 1 ? "user" : "users"}`;
  document.getElementById("roleCountContributor").textContent = countLabel(users.filter(u => u.role === "technician").length);
  document.getElementById("roleCountReviewer").textContent = countLabel(users.filter(u => u.role === "admin").length);
  document.getElementById("roleCountAdmin").textContent = countLabel(users.filter(u => u.role === "super_admin").length);

  renderUserListTable();
}
function renderUserListTable(){
  const body = document.getElementById("userListBody");
  const q = (document.getElementById("userSearchInput").value || "").trim().toLowerCase();
  const roleFilter = document.getElementById("userRoleFilter").value;
  let users = _usersCache;
  if(q) users = users.filter(u => u.display_name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  if(roleFilter) users = users.filter(u => u.role === roleFilter);

  if(!users.length){
    body.innerHTML = `<tr><td colspan="4" class="muted-small">No matching accounts.</td></tr>`;
    return;
  }
  body.innerHTML = users.map(u => {
    const canDeactivate = u.is_active && u.username !== currentUsername && u.role !== "super_admin" &&
      (currentRole === "super_admin" || u.role === "technician");
    const initials = (u.display_name || "?").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
    return `
      <tr>
        <td>
          <div class="entry-cell">
            <span class="avatar avatar-sm">${escapeHtml(initials)}</span>
            <div><b>${escapeHtml(u.display_name)}</b><span class="muted-small">@${escapeHtml(u.username)}</span></div>
          </div>
        </td>
        <td>${roleLabel(u.role)}</td>
        <td><span class="status ${u.is_active ? "st-solved" : "st-cancelled"}">${u.is_active ? "Active" : "Deactivated"}</span></td>
        <td>${canDeactivate ? `<button type="button" class="btn-link btn-link-danger" data-deactivate="${escapeAttr(u.username)}">Deactivate</button>` : ""}</td>
      </tr>`;
  }).join("");
  body.querySelectorAll("[data-deactivate]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if(btn.dataset.armed !== "1"){
        btn.dataset.armed = "1";
        btn.textContent = "Confirm?";
        setTimeout(() => { if(btn.dataset.armed === "1"){ btn.dataset.armed = "0"; btn.textContent = "Deactivate"; } }, 3000);
        return;
      }
      const uname = btn.getAttribute("data-deactivate");
      const result = await api().deactivate_user(uname);
      if(result && result.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(result.apiError); return; }
      if(result && result.apiError){ alert(result.apiError); return; }
      await refreshUserList();
    });
  });
}

async function submitCreateUser(){
  const username = document.getElementById("nuUsername").value.trim();
  const displayName = document.getElementById("nuDisplayName").value.trim();
  const password = document.getElementById("nuPassword").value;
  const role = document.getElementById("nuRole").value;
  const errEl = document.getElementById("nuError");
  if(!username || !password){
    errEl.textContent = "Username and password are required.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("nuCreateBtn");
  btn.disabled = true;
  const result = await api().create_user(username, password, displayName, role);
  btn.disabled = false;
  if(result && result.needsLogin){ closeOverlay("manageUsersOverlay"); showLoginScreen(result.apiError); return; }
  if(result && result.apiError){
    errEl.textContent = result.apiError;
    errEl.style.display = "";
    return;
  }
  errEl.style.display = "none";
  document.getElementById("nuUsername").value = "";
  document.getElementById("nuDisplayName").value = "";
  document.getElementById("nuPassword").value = "";
  await refreshUserList();
}
async function openAddAppModal(){
  const name = await openAddAppModalUI();
  if(!name) return null;
  if(!allApps.includes(name)){
    const result = await api().add_application(name);
    if(result && result.apiError){ alert(result.apiError); return null; }
    allApps = result;
    refreshAllAppWidgets();
  }
  return name;
}

/* ============================== issue detail / edit ============================== */
function renderDetailView(issue){
  document.getElementById("dId").textContent = issue.id;
  const statusEl = document.getElementById("dStatus");
  statusEl.className = `status ${statusClass(issue.status)}`;
  statusEl.textContent = statusLabel(issue.status);
  document.getElementById("dTitle").textContent = issue.title;
  document.getElementById("dSystem").textContent = issue.system || "—";
  const errorWrap = document.getElementById("dErrorWrap");
  if(issue.error){ errorWrap.style.display = ""; document.getElementById("dError").textContent = issue.error; }
  else { errorWrap.style.display = "none"; }
  document.getElementById("dCreated").textContent = formatDate(issue.createdAt);
  document.getElementById("dApps").innerHTML = (issue.apps || [])
    .map(a => `<span class="chip">${escapeHtml(a)}</span>`).join("");
  const type = issue.type || "PROBLEM_SOLUTION";
  const typeMeta = typeBadgeInfo(type);
  const dTypeIcon = document.getElementById("dTypeIcon");
  dTypeIcon.textContent = typeMeta.glyph;
  dTypeIcon.className = "type-glyph type-glyph-sm " + typeMeta.glyphClass;
  document.getElementById("dTypeLabel").textContent = typeMeta.label;
  document.getElementById("dPSBlock").style.display = type === "PROBLEM_SOLUTION" ? "" : "none";
  document.getElementById("dInfoBlock").style.display = type === "INFORMATION" ? "" : "none";
  document.getElementById("dProcBlock").style.display = type === "PROCEDURE" ? "" : "none";
  document.getElementById("dProcBlock2").style.display = type === "PROCEDURE" ? "" : "none";
  document.getElementById("dStepsWrap").style.display = type === "INFORMATION" ? "none" : "";

  if(type === "PROBLEM_SOLUTION"){
    document.getElementById("dProblem").textContent = issue.problem;
    document.getElementById("dRoot").textContent = issue.root;
    document.getElementById("dSolution").textContent = issue.solution;
  } else if(type === "INFORMATION"){
    document.getElementById("dTopic").textContent = issue.topic || "";
    document.getElementById("dDescription").textContent = issue.description || "";
    document.getElementById("dContextWrap").style.display = issue.context ? "" : "none";
    document.getElementById("dContext").textContent = issue.context || "";
  } else if(type === "PROCEDURE"){
    document.getElementById("dPurpose").textContent = issue.purpose || "";
    document.getElementById("dPrereqsWrap").style.display = issue.prerequisites ? "" : "none";
    document.getElementById("dPrereqs").textContent = issue.prerequisites || "";
    document.getElementById("dWarningsWrap").style.display = issue.warnings ? "" : "none";
    document.getElementById("dWarnings").textContent = issue.warnings || "";
    document.getElementById("dAdditionalInfoWrap").style.display = issue.additionalInfo ? "" : "none";
    document.getElementById("dAdditionalInfo").textContent = issue.additionalInfo || "";
  }
  document.getElementById("dSteps").innerHTML = (issue.steps || [])
    .map(([action, app]) => `<li>${escapeHtml(action)}${app ? ` <span class="detail-step-app">(${escapeHtml(app)})</span>` : ""}</li>`)
    .join("");
  const attBlock = document.getElementById("dAttachmentsBlock");
  if(issue.attachments && issue.attachments.length){
    attBlock.style.display = "";
    renderAttachmentList(document.getElementById("dAttachments"), issue.attachments, issue.id, false);
  } else {
    attBlock.style.display = "none";
  }

  document.getElementById("dAuthor").textContent = issue.createdBy || "—";
  document.getElementById("dEntryId").textContent = issue.id;
  const validatedWrap = document.getElementById("dValidatedByWrap");
  if(issue.status === "solved" && issue.updatedBy){
    validatedWrap.style.display = "";
    document.getElementById("dValidatedBy").textContent = `${issue.updatedBy} · ${formatDate(issue.updatedAt)}`;
  } else {
    validatedWrap.style.display = "none";
  }
}

/* Related knowledge: other trusted (solved) entries that share an
   application with this one -- a real, if simple, signal (no similarity
   search or category system exists on the server to do better than this). */
async function renderRelatedKnowledge(issue){
  const block = document.getElementById("dRelatedBlock");
  if(issue.status !== "solved" || !(issue.apps || []).length){ block.style.display = "none"; return; }
  const items = await _loadAllIssues();
  const related = items.filter(i => i.id !== issue.id && i.status === "solved"
    && (i.apps || []).some(a => issue.apps.includes(a))).slice(0, 3);
  if(!related.length){ block.style.display = "none"; return; }
  block.style.display = "";
  document.getElementById("dRelated").innerHTML = related.map(i => `
    <div class="user-row related-row" data-open="${escapeAttr(i.id)}">
      <span class="issue-id">${escapeHtml(i.id)}</span>
      <span class="user-row-name">${escapeHtml(i.title)}</span>
    </div>`).join("");
  document.getElementById("dRelated").querySelectorAll("[data-open]").forEach(el => {
    el.addEventListener("click", () => openDetail(el.getAttribute("data-open")));
  });
}

function ensureEditAppsPicker(){
  if(editAppsPicker) return editAppsPicker;
  editAppsPicker = createAppsPicker({
    pickerEl: document.getElementById("eAppsPicker"),
    chipsEl: document.getElementById("eAppChips"),
    toggleEl: document.getElementById("eAppsPickerToggle"),
    dropdownEl: document.getElementById("eAppsDropdown"),
    getSelected: () => editApps,
    onChange: (next) => { editApps = next; },
  });
  return editAppsPicker;
}

function renderDetailEdit(issue){
  document.getElementById("eTitle").value = issue.title;
  const statusSelect = document.getElementById("eStatus");
  statusSelect.value = issue.status;
  // Content stays editable by anyone; only the status/phase itself
  // requires an admin -- server enforces this too, this just avoids
  // someone filling out a whole edit only to have the status change
  // rejected at save time.
  statusSelect.disabled = !isAdminOrAbove();
  statusSelect.title = statusSelect.disabled ? "Only an admin can change an issue's status" : "";
  document.getElementById("eError").value = issue.error || "";
  document.getElementById("eProblem").value = issue.problem;
  document.getElementById("eRoot").value = issue.root;
  document.getElementById("eSolution").value = issue.solution;

  editApps = (issue.apps || []).slice();
  const picker = ensureEditAppsPicker();
  picker.renderChips();
  picker.renderDropdown();

  const stepsBody = document.getElementById("eStepsBody");
  clearSteps(stepsBody);
  (issue.steps || []).forEach(([action, app]) => addStep(stepsBody, action, app));

  renderAttachmentList(document.getElementById("eAttachments"), issue.attachments || [], issue.id, true);
  document.querySelectorAll("#detailEdit .attach-box").forEach(btn => {
    btn.onclick = async () => {
      const path = await api().pick_file();
      if(!path) return;
      const result = await api().add_attachment(issue.id, btn.getAttribute("data-kind"), path);
      if(result && !result.apiError){
        currentDetailIssue = result;
        renderAttachmentList(document.getElementById("eAttachments"), result.attachments, issue.id, true);
      }
    };
  });
}

function showDetailView(){
  document.getElementById("detailEdit").style.display = "none";
  document.getElementById("detailEditInfo").style.display = "none";
  document.getElementById("detailEditProc").style.display = "none";
  document.getElementById("detailView").style.display = "";
  // "Solved" fully locks the issue (matches the original design); every
  // other status stays editable by anyone -- only the status field itself
  // is admin-gated, enforced separately in renderDetailEdit()/the server.
  const isPS = (currentDetailIssue.type || "PROBLEM_SOLUTION") === "PROBLEM_SOLUTION";
  const locked = currentDetailIssue.status === "solved" && !isAdminOrAbove();
  document.getElementById("dEditBtn").style.display = locked ? "none" : "";
  const lockedNote = document.getElementById("dLockedNote");
  lockedNote.style.display = locked ? "" : "none";
  lockedNote.textContent = locked ? "Solved — only an admin can change this" : "";
  document.getElementById("dSaveBtn").style.display = "none";
  document.getElementById("dCancelBtn").style.display = "none";
  const reviewBar = document.getElementById("reviewBar");
  const needsReview = isAdminOrAbove() && !["solved", "cancelled"].includes(currentDetailIssue.status);
  reviewBar.style.display = needsReview ? "" : "none";
  if(needsReview){
    reviewBar.querySelectorAll("input[name=reviewDecision]").forEach(r => { r.checked = r.value === "request_changes"; });
    reviewBar.querySelectorAll("[data-vc]").forEach(cb => { cb.checked = false; });
    document.getElementById("reviewCommentInput").value = "";
    document.getElementById("reviewCommentError").style.display = "none";
    updateReviewDecisionUI();
  }
  renderDetailView(currentDetailIssue);
}
const REVIEW_DECISION_META = {
  approve: { label: "Approve and publish", btnClass: "btn-success" },
  request_changes: { label: "Send back to author", btnClass: "btn-warn" },
  reject: { label: "Reject entry", btnClass: "btn-danger" },
};
function currentReviewDecision(){
  const checked = document.querySelector('#reviewBar input[name=reviewDecision]:checked');
  return checked ? checked.value : "request_changes";
}
function updateReviewDecisionUI(){
  const decision = currentReviewDecision();
  document.querySelectorAll("#reviewBar .decision-option").forEach(el => {
    el.classList.toggle("decision-selected", el.dataset.decision === decision);
  });
  const meta = REVIEW_DECISION_META[decision];
  const btn = document.getElementById("reviewSubmitBtn");
  btn.textContent = meta.label;
  btn.className = "btn btn-block review-submit-btn " + meta.btnClass;
  document.getElementById("reviewCommentError").style.display = "none";
}
async function _reviewSetStatus(newStatus, confirmOpts){
  const ok = await confirmDialog(confirmOpts);
  if(!ok) return;
  const issue = currentDetailIssue;
  // Send every field back, not just a hand-picked subset -- IssueIn
  // defaults any omitted field to "", so a partial body here would
  // silently wipe an Information/Procedure entry's real content (topic,
  // description, purpose, etc.) on every Approve/Reject/status change.
  const body = {
    title: issue.title, system: issue.system, status: newStatus, type: issue.type, error: issue.error,
    apps: issue.apps, problem: issue.problem, root: issue.root, solution: issue.solution, steps: issue.steps,
    topic: issue.topic, description: issue.description, context: issue.context,
    purpose: issue.purpose, prerequisites: issue.prerequisites, warnings: issue.warnings,
    additionalInfo: issue.additionalInfo,
  };
  const result = await api().update_issue(issue.id, body);
  if(result && result.needsLogin){ closeDetail(); showLoginScreen(result.apiError); return; }
  if(result && result.apiError){ alert(result.apiError); return; }
  currentDetailIssue = result;
  showDetailView();
  await renderList();
  refreshDashboard(); refreshReviewQueue();
}
async function submitReviewDecision(){
  const decision = currentReviewDecision();
  const errEl = document.getElementById("reviewCommentError");
  errEl.style.display = "none";
  if(decision === "approve"){
    const missing = Array.from(document.querySelectorAll("#reviewBar [data-vc]")).some(cb => !cb.checked);
    if(missing){
      errEl.textContent = "Complete the validation checklist before approving.";
      errEl.style.display = "";
      return;
    }
    await _reviewSetStatus("solved", {
      icon: "check", iconClass: "success", title: "Publish to trusted knowledge?",
      text: `Everyone in the organization will see "${currentDetailIssue.title}". It will also be available to the AI Assistant when it launches.`,
      actionLabel: "Approve and publish", actionClass: "btn-success",
    });
    return;
  }
  if(decision === "reject"){
    await _reviewSetStatus("cancelled", {
      icon: "xMark", iconClass: "danger", title: "Reject this entry?",
      text: `"${currentDetailIssue.title}" will be closed and not published. This can be reopened later by an admin.`,
      actionLabel: "Reject entry", actionClass: "btn-danger",
    });
    return;
  }
  // request_changes
  const message = document.getElementById("reviewCommentInput").value.trim();
  if(!message){ errEl.textContent = "Say what should change before sending."; errEl.style.display = ""; return; }
  const btn = document.getElementById("reviewSubmitBtn");
  if(btn.disabled) return;
  btn.disabled = true;
  try {
    const result = await api().comment_issue(currentDetailIssue.id, message);
    if(result && result.needsLogin){ closeDetail(); showLoginScreen(result.apiError); return; }
    if(result && result.apiError){ errEl.textContent = result.apiError; errEl.style.display = ""; return; }
    document.getElementById("reviewCommentInput").value = "";
    await refreshNotifications();
    closeDetail();
  } finally {
    btn.disabled = false;
  }
}
function reviewSaveForLater(){
  showToast("Not saved", "Review notes aren't stored between sessions yet — finish or cancel this review for now.");
}
function showDetailEdit(){
  const type = currentDetailIssue.type || "PROBLEM_SOLUTION";
  document.getElementById("detailView").style.display = "none";
  document.getElementById("detailEdit").style.display = type === "PROBLEM_SOLUTION" ? "" : "none";
  document.getElementById("detailEditInfo").style.display = type === "INFORMATION" ? "" : "none";
  document.getElementById("detailEditProc").style.display = type === "PROCEDURE" ? "" : "none";
  document.getElementById("dEditBtn").style.display = "none";
  document.getElementById("dSaveBtn").style.display = "";
  document.getElementById("dCancelBtn").style.display = "";
  if(type === "INFORMATION") renderDetailEditInfo(currentDetailIssue);
  else if(type === "PROCEDURE") renderDetailEditProc(currentDetailIssue);
  else renderDetailEdit(currentDetailIssue);
}
function _setEditStatus(id, issue){
  const sel = document.getElementById(id);
  sel.value = issue.status;
  sel.disabled = !isAdminOrAbove();
  sel.title = sel.disabled ? "Only an admin can change an issue's status" : "";
}
function renderDetailEditInfo(issue){
  document.getElementById("eiTitle").value = issue.title || "";
  _setEditStatus("eiStatus", issue);
  document.getElementById("eiTopic").value = issue.topic || "";
  document.getElementById("eiDescription").value = issue.description || "";
  document.getElementById("eiContext").value = issue.context || "";
}
function renderDetailEditProc(issue){
  document.getElementById("epTitle").value = issue.title || "";
  _setEditStatus("epStatus", issue);
  document.getElementById("epPurpose").value = issue.purpose || "";
  document.getElementById("epPrereqs").value = issue.prerequisites || "";
  document.getElementById("epWarnings").value = issue.warnings || "";
  document.getElementById("epAdditional").value = issue.additionalInfo || "";
  const body = document.getElementById("epStepsBody");
  clearSteps(body);
  (issue.steps || []).forEach(([action, app]) => addStep(body, action, app));
  if(!(issue.steps || []).length) addStep(body);
}

const HISTORY_ACTION_LABEL = {
  create_issue: "created this issue",
  update_issue: "updated this issue",
  add_attachment: "added an attachment",
  remove_attachment: "removed an attachment",
};
function renderHistory(entries){
  const box = document.getElementById("dHistory");
  if(!entries || entries.length === 0){
    box.innerHTML = '<div class="hint" style="padding:8px 0;">No history yet.</div>';
    return;
  }
  box.innerHTML = entries.map(e => `
    <div class="user-row">
      <span class="user-row-name"><b>${escapeHtml(e.username)}</b> ${HISTORY_ACTION_LABEL[e.action] || escapeHtml(e.action)}</span>
      <span class="muted-small">${formatDate(e.at)}</span>
    </div>
  `).join("");
}

async function openDetail(id, editAfter){
  const [issue, history] = await Promise.all([api().get_issue(id), api().get_issue_history(id)]);
  if(!issue || issue.apiError){
    if(issue && issue.needsLogin) showLoginScreen(issue.apiError);
    else alert((issue && issue.apiError) || "Could not load that issue.");
    return;
  }
  currentDetailIssue = issue;
  showDetailView();
  renderHistory(history);
  renderRelatedKnowledge(issue);
  openOverlay("detailOverlay");
  if(editAfter) showDetailEdit();
}
function closeDetail(){ closeOverlay("detailOverlay"); }

async function saveDetailEditOtherType(){
  const issue = currentDetailIssue;
  const base = { type: issue.type, system: issue.system || "", apps: (issue.apps || []).slice() };
  let payload;
  if(issue.type === "INFORMATION"){
    const title = document.getElementById("eiTitle").value.trim();
    const topic = document.getElementById("eiTopic").value.trim();
    const description = document.getElementById("eiDescription").value.trim();
    if(!title || !topic || !description){ alert("Please fill in the title, topic and description before saving."); return; }
    payload = { ...base, title, status: document.getElementById("eiStatus").value, topic, description,
      context: document.getElementById("eiContext").value.trim() };
  } else {
    const title = document.getElementById("epTitle").value.trim();
    const purpose = document.getElementById("epPurpose").value.trim();
    const steps = collectSteps(document.getElementById("epStepsBody"));
    if(!title || !purpose || steps.length === 0){ alert("Please fill in the title, purpose and at least one step before saving."); return; }
    payload = { ...base, title, status: document.getElementById("epStatus").value, purpose,
      prerequisites: document.getElementById("epPrereqs").value.trim(), steps,
      warnings: document.getElementById("epWarnings").value.trim(),
      additionalInfo: document.getElementById("epAdditional").value.trim() };
  }
  const result = await api().update_issue(issue.id, payload);
  if(result && result.apiError){
    if(result.needsLogin) showLoginScreen(result.apiError);
    else alert(result.apiError);
    return;
  }
  currentDetailIssue = result;
  showDetailView();
  renderHistory(await api().get_issue_history(currentDetailIssue.id));
  await renderList();
  showToast("Entry updated", `"${result.title}" was saved.`);
}

async function saveDetailEdit(){
  if((currentDetailIssue.type || "PROBLEM_SOLUTION") !== "PROBLEM_SOLUTION") return saveDetailEditOtherType();
  const title = document.getElementById("eTitle").value.trim();
  const status = document.getElementById("eStatus").value;
  const error = document.getElementById("eError").value.trim();
  const problem = document.getElementById("eProblem").value.trim();
  const root = document.getElementById("eRoot").value.trim();
  const solution = document.getElementById("eSolution").value.trim();
  const steps = collectSteps(document.getElementById("eStepsBody"));

  if(!title || editApps.length === 0 || !problem || !root || !solution || steps.length === 0){
    alert("Please fill in the required fields (title, at least one application, problem, root cause, solution, and at least one step) before saving.");
    return;
  }
  const result = await api().update_issue(currentDetailIssue.id, {
    title, status, error, apps: editApps.slice(), problem, root, solution, steps,
  });
  if(result && result.apiError){
    if(result.needsLogin) showLoginScreen(result.apiError);
    else alert(result.apiError);
    return;
  }
  currentDetailIssue = result;
  showDetailView();
  renderHistory(await api().get_issue_history(currentDetailIssue.id));
  await renderList();
}

/* ============================== capture: type step + local drafts ============================== */
/* Drafts are real, but device-local (localStorage) -- no draft-storage
   endpoint exists on the server, and the spec is explicit that drafts are
   "only visible to you", which a local-only store honestly satisfies.
   Only Problem/Solution has a real destination on submit (the server's
   /issues only understands that shape) -- Information/Procedure are shown
   per the design but flagged as not yet accepted, not faked as working. */
const DRAFT_KEY = "rck_draft_problem_solution";
function draftKeyFor(){ return `${DRAFT_KEY}::${currentUsername || "anon"}`; }
function saveDraft(){
  try {
    const data = { type: "PROBLEM_SOLUTION", apps: currentApps.slice(), ...collectForm(), savedAt: new Date().toISOString() };
    const hasContent = data.title || data.problem || data.root || data.solution || (data.steps || []).some(s => s[0]);
    if(hasContent) localStorage.setItem(draftKeyFor(), JSON.stringify(data));
    else localStorage.removeItem(draftKeyFor());
  } catch(e) { /* private mode etc -- drafts are best-effort */ }
}
function loadDraft(){
  try { const raw = localStorage.getItem(draftKeyFor()); return raw ? JSON.parse(raw) : null; } catch(e) { return null; }
}
function deleteDraft(){ try { localStorage.removeItem(draftKeyFor()); } catch(e) {} }

function showCaptureTypeStep(){
  document.getElementById("captureTypeScreen").style.display = "";
  Object.values(CAPTURE_SCREENS).forEach(id => { document.getElementById(id).style.display = "none"; });
  const draft = loadDraft();
  const card = document.getElementById("captureDraftCard");
  if(draft){
    card.style.display = "";
    document.getElementById("captureDraftList").innerHTML = `
      <div class="draft-row">
        <span class="row-icon">${iconSvg("edit")}</span>
        <div class="row-body">
          <div class="row-title">${escapeHtml(draft.title || "(untitled)")}</div>
          <div class="row-sub">Problem / Solution · Draft · autosaved ${formatDate(draft.savedAt)}</div>
        </div>
        <div class="row-right">
          <span class="status st-review">DRAFT</span>
          <button type="button" class="btn btn-outline btn-sm" id="draftContinueBtn">Continue</button>
          <button type="button" class="btn-icon-only" id="draftDeleteBtn" title="Delete draft">${iconSvg("trash")}</button>
        </div>
      </div>`;
    document.getElementById("draftContinueBtn").addEventListener("click", () => showCaptureFormStep("PROBLEM_SOLUTION", draft));
    document.getElementById("draftDeleteBtn").addEventListener("click", () => { deleteDraft(); showCaptureTypeStep(); });
  } else {
    card.style.display = "none";
  }
}

const CAPTURE_SCREENS = { PROBLEM_SOLUTION: "captureFormScreen", INFORMATION: "captureInfoScreen", PROCEDURE: "captureProcScreen" };
function showCaptureFormStep(type, draft){
  document.getElementById("captureTypeScreen").style.display = "none";
  Object.values(CAPTURE_SCREENS).forEach(id => { document.getElementById(id).style.display = "none"; });
  document.getElementById(CAPTURE_SCREENS[type]).style.display = "";

  if(type === "PROBLEM_SOLUTION"){
    if(draft){
      document.getElementById("fTitle").value = draft.title || "";
      document.getElementById("fError").value = draft.error || "";
      document.getElementById("fProblem").value = draft.problem || "";
      document.getElementById("fRoot").value = draft.root || "";
      document.getElementById("fSolution").value = draft.solution || "";
      document.getElementById("cProblem").textContent = document.getElementById("fProblem").value.length;
      document.getElementById("cRoot").textContent = document.getElementById("fRoot").value.length;
      document.getElementById("cSolution").textContent = document.getElementById("fSolution").value.length;
      currentApps = (draft.apps || []).slice();
      renderChips();
      const stepsBody = document.getElementById("stepsBody");
      clearSteps(stepsBody);
      const steps = (draft.steps || []).filter(([a]) => a);
      if(steps.length) steps.forEach(([action, app]) => addStep(stepsBody, action, app));
      else { addStep(stepsBody); addStep(stepsBody); }
    }
    document.getElementById("fTitle").focus();
  } else if(type === "INFORMATION"){
    document.getElementById("refLabelInfo").textContent = "…";
    api().next_ref_id().then(id => { document.getElementById("refLabelInfo").textContent = id; });
    document.getElementById("iTitle").focus();
  } else if(type === "PROCEDURE"){
    document.getElementById("refLabelProc").textContent = "…";
    api().next_ref_id().then(id => { document.getElementById("refLabelProc").textContent = id; });
    if(!document.getElementById("procStepsBody").children.length){
      addStep(document.getElementById("procStepsBody"));
      addStep(document.getElementById("procStepsBody"));
    }
    document.getElementById("pTitle").focus();
  }
}

let _draftSaveTimer = null;
function scheduleDraftSave(){
  if(_draftSaveTimer) clearTimeout(_draftSaveTimer);
  _draftSaveTimer = setTimeout(saveDraft, 800);
}

/* ============================== capture form ============================== */
function renderChips(){
  if(mainAppsPicker) mainAppsPicker.renderChips();
}
function collectForm(){
  return {
    title: document.getElementById("fTitle").value.trim(),
    problem: document.getElementById("fProblem").value.trim(),
    root: document.getElementById("fRoot").value.trim(),
    solution: document.getElementById("fSolution").value.trim(),
    error: document.getElementById("fError").value.trim(),
    steps: collectSteps(document.getElementById("stepsBody")),
  };
}
async function clearForm(){
  document.getElementById("fTitle").value = "";
  document.getElementById("fError").value = "";
  document.getElementById("fProblem").value = "";
  document.getElementById("fRoot").value = "";
  document.getElementById("fSolution").value = "";
  document.getElementById("cProblem").textContent = "0";
  document.getElementById("cRoot").textContent = "0";
  document.getElementById("cSolution").textContent = "0";
  currentApps = [];
  renderChips();
  stagedAttachments = [];
  renderStagedAttachments();
  clearSteps(document.getElementById("stepsBody"));
  addStep(document.getElementById("stepsBody"));
  addStep(document.getElementById("stepsBody"));
  document.getElementById("refLabel").textContent = await api().next_ref_id();
}
async function submitIssue(status){
  const f = collectForm();
  if(!f.title || currentApps.length===0 || !f.problem || !f.root || !f.solution || f.steps.length===0){
    alert("Please fill in the required fields (title, at least one application, problem, root cause, solution, and at least one step) before submitting.");
    return;
  }
  // Without this guard, clicking (or double-clicking on a slow connection)
  // Submit more than once fires a separate POST per click, each creating
  // its own duplicate issue with its own REF-ID -- confirmed happening in
  // practice, not theoretical. Same disable-while-in-flight pattern as
  // attemptLogin() already uses for the same reason.
  const btn = document.getElementById("submitBtn");
  if(btn.disabled) return;
  btn.disabled = true;
  try {
    const result = await api().add_issue({
      title: f.title, system: currentApps[0], status, error: f.error,
      apps: currentApps.slice(), problem: f.problem, root: f.root, solution: f.solution,
      steps: f.steps,
    });
    if(result && result.apiError){
      if(result.needsLogin) showLoginScreen(result.apiError);
      else alert(result.apiError);
      return;
    }
    // Attachments are uploaded one by one after creation -- the server can't
    // read a path on the client's disk, so each staged file's bytes have to
    // be sent up explicitly now that we have a real issue id to attach to.
    for(const staged of stagedAttachments){
      const attachResult = await api().add_attachment(result.id, staged.kind, staged.path);
      if(attachResult && attachResult.apiError){
        alert(`"${result.id}" was saved, but attaching "${staged.name}" failed: ${attachResult.apiError}`);
      }
    }
    await renderList();
    await clearForm();
    deleteDraft();
    showToast("Knowledge captured", `"${result.title}" was submitted as ${result.id} -- pending review.`);
    showCaptureTypeStep();
    showView("my-entries");
    refreshDashboard();
  } finally {
    btn.disabled = false;
  }
}

async function clearInfoForm(){
  document.getElementById("iTitle").value = "";
  document.getElementById("iTopic").value = "";
  document.getElementById("iDescription").value = "";
  document.getElementById("cIDescription").textContent = "0";
  document.getElementById("iContext").value = "";
  currentInfoApps = [];
  if(infoAppsPicker) infoAppsPicker.renderChips();
  document.getElementById("refLabelInfo").textContent = await api().next_ref_id();
}
async function submitInformation(){
  const title = document.getElementById("iTitle").value.trim();
  const topic = document.getElementById("iTopic").value.trim();
  const description = document.getElementById("iDescription").value.trim();
  const context = document.getElementById("iContext").value.trim();
  if(!title || !topic || !description){
    alert("Please fill in the required fields (title, topic, and description) before submitting.");
    return;
  }
  const btn = document.getElementById("submitInfoBtn");
  if(btn.disabled) return;
  btn.disabled = true;
  try {
    const result = await api().add_issue({
      title, type: "INFORMATION", system: currentInfoApps[0] || "", apps: currentInfoApps.slice(),
      topic, description, context,
    });
    if(result && result.apiError){
      if(result.needsLogin) showLoginScreen(result.apiError);
      else alert(result.apiError);
      return;
    }
    await renderList();
    await clearInfoForm();
    showToast("Knowledge captured", `"${result.title}" was submitted as ${result.id} -- pending review.`);
    showCaptureTypeStep();
    showView("my-entries");
    refreshDashboard();
  } finally {
    btn.disabled = false;
  }
}

async function clearProcForm(){
  document.getElementById("pTitle").value = "";
  document.getElementById("pPurpose").value = "";
  document.getElementById("pPrereqs").value = "";
  document.getElementById("pWarnings").value = "";
  document.getElementById("pAdditionalInfo").value = "";
  currentProcApps = [];
  if(procAppsPicker) procAppsPicker.renderChips();
  clearSteps(document.getElementById("procStepsBody"));
  addStep(document.getElementById("procStepsBody"));
  addStep(document.getElementById("procStepsBody"));
  document.getElementById("refLabelProc").textContent = await api().next_ref_id();
}
async function submitProcedure(){
  const title = document.getElementById("pTitle").value.trim();
  const purpose = document.getElementById("pPurpose").value.trim();
  const prerequisites = document.getElementById("pPrereqs").value.trim();
  const warnings = document.getElementById("pWarnings").value.trim();
  const additionalInfo = document.getElementById("pAdditionalInfo").value.trim();
  const steps = collectSteps(document.getElementById("procStepsBody"));
  if(!title || !purpose || steps.length === 0){
    alert("Please fill in the required fields (title, purpose, and at least one step) before submitting.");
    return;
  }
  const btn = document.getElementById("submitProcBtn");
  if(btn.disabled) return;
  btn.disabled = true;
  try {
    const result = await api().add_issue({
      title, type: "PROCEDURE", system: currentProcApps[0] || "", apps: currentProcApps.slice(),
      purpose, prerequisites, steps, warnings, additionalInfo,
    });
    if(result && result.apiError){
      if(result.needsLogin) showLoginScreen(result.apiError);
      else alert(result.apiError);
      return;
    }
    await renderList();
    await clearProcForm();
    showToast("Knowledge captured", `"${result.title}" was submitted as ${result.id} -- pending review.`);
    showCaptureTypeStep();
    showView("my-entries");
    refreshDashboard();
  } finally {
    btn.disabled = false;
  }
}

/* ============================== shell: sidebar nav + views ============================== */
const VIEW_TITLES = {
  dashboard: "Dashboard", capture: "Capture knowledge", "my-entries": "My entries",
  trusted: "Trusted knowledge", "review-queue": "Review queue",
  notifications: "Notifications", "notification-detail": "Notification", "ai-assistant": "AI Assistant",
  "my-account": "My account", settings: "Settings",
};
// Breadcrumb = "Section  ›  Page", matching the shell's own section
// groupings (Workspace/Knowledge/Validation/Assistant/Account/
// Administration) -- Dashboard is the one exception, shown bare as the
// app's home page.
const VIEW_SECTIONS = {
  notifications: "Workspace", "notification-detail": "Notifications", capture: "Knowledge", "my-entries": "Knowledge", trusted: "Knowledge",
  "review-queue": "Validation", "ai-assistant": "Assistant", "my-account": "Account", settings: "Administration",
};
function renderBreadcrumb(view){
  const section = VIEW_SECTIONS[view];
  const title = VIEW_TITLES[view] || "Dashboard";
  const crumb = document.getElementById("topbarCrumb");
  crumb.innerHTML = section
    ? `<span class="crumb-section">${escapeHtml(section)}</span><span class="crumb-sep">›</span><span class="crumb-current">${escapeHtml(title)}</span>`
    : `<span class="crumb-current">${escapeHtml(title)}</span>`;
}
async function showView(view){
  document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
  const navView = view === "notification-detail" ? "notifications" : view;
  document.querySelectorAll(".side-link[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === navView));
  document.getElementById("accountMenu").classList.remove("open");
  renderBreadcrumb(view);
  if(view === "dashboard") await refreshDashboard();
  else if(view === "capture") showCaptureTypeStep();
  else if(view === "my-entries") await refreshMyEntries();
  else if(view === "trusted") await refreshTrusted();
  else if(view === "review-queue") await refreshReviewQueue();
  else if(view === "notifications") await refreshNotifPage();
  else if(view === "ai-assistant") await refreshAiAssistant();
  else if(view === "my-account") refreshMyAccount();
  else if(view === "settings") await refreshSettingsView();
}
function wireShellNav(){
  document.querySelectorAll("[data-view]").forEach(el => {
    el.addEventListener("click", () => showView(el.dataset.view));
  });
  const accountBtn = document.getElementById("accountBtn");
  const accountMenu = document.getElementById("accountMenu");
  accountBtn.addEventListener("click", e => {
    e.stopPropagation();
    accountMenu.classList.toggle("open");
  });
  document.addEventListener("click", () => accountMenu.classList.remove("open"));

  document.querySelectorAll('[data-status-tab]').forEach(el => {
    el.addEventListener("click", () => setMyEntriesTab(el.dataset.statusTab));
  });
  document.getElementById("myEntriesViewCommentsBtn").addEventListener("click", () => {
    if(_myEntriesLatestChange) openDetail(_myEntriesLatestChange.id);
  });
  document.getElementById("myEntriesAddressBtn").addEventListener("click", () => {
    if(_myEntriesLatestChange) openDetail(_myEntriesLatestChange.id, true);
  });
  document.querySelectorAll('[data-rq-tab]').forEach(el => {
    el.addEventListener("click", () => setReviewQueueTab(el.dataset.rqTab));
  });
  document.getElementById("rqSearchInput").addEventListener("input", () => renderReviewQueueTab());
  document.getElementById("rqSortSelect").addEventListener("change", () => renderReviewQueueTab());
  document.getElementById("reviewGuidelinesBtn").addEventListener("click", () => showToast(
    "Review guidelines", "Check accuracy, completeness, and that there's no sensitive data before approving."));
  document.getElementById("accountMenuAppPrefsBtn").addEventListener("click", () => {
    showView("my-account");
    setAccountTab("preferences");
  });
  document.getElementById("accountMenuGuidelinesBtn").addEventListener("click", () => showToast(
    "Contribution guidelines", "Be specific and reproducible, avoid sensitive data, and check for an existing entry before capturing a new one."));
  document.getElementById("accountMenuShortcutsBtn").addEventListener("click", () => showToast(
    "Keyboard shortcuts", "Ctrl/Cmd+K focuses search from anywhere."));
  document.querySelectorAll('[data-notif-tab]').forEach(el => {
    el.addEventListener("click", () => setNotifPageTab(el.dataset.notifTab));
  });
  document.getElementById("notifDetailBack").addEventListener("click", () => showView("notifications"));
  document.getElementById("notifMarkAllReadBtn").addEventListener("click", async () => {
    await api().mark_notifications_seen();
    await refreshNotifPage();
    setNotifRead(buildNotifItems("all"), true);
    renderNotifPageGrouped(_notifPageTab);
    refreshNotifBadgesOnly();
  });
  document.querySelectorAll("[data-notif-seg]").forEach(el => el.addEventListener("click", () => {
    _notifReadFilter = el.dataset.notifSeg; renderNotifPageGrouped(_notifPageTab);
  }));
  document.querySelectorAll('[data-settings-tab]').forEach(el => {
    el.addEventListener("click", () => setSettingsTab(el.dataset.settingsTab));
  });
  document.getElementById("userSearchInput").addEventListener("input", renderUserListTable);
  document.getElementById("userRoleFilter").addEventListener("change", renderUserListTable);
  document.querySelectorAll('[data-account-tab]').forEach(el => {
    el.addEventListener("click", () => setAccountTab(el.dataset.accountTab));
  });
  document.querySelectorAll(".density-btn").forEach(el => {
    el.addEventListener("click", () => { setPref("density", el.dataset.density); applyDensityPref(); });
  });
  document.getElementById("prefStartPage").addEventListener("change", e => setPref("startPage", e.target.value));
  document.getElementById("trustedSearchBtn").addEventListener("click", () => refreshTrusted());
  document.getElementById("trustedSearchInput").addEventListener("keydown", e => { if(e.key === "Enter") refreshTrusted(); });
  document.getElementById("trustedFilterApp").addEventListener("change", () => refreshTrusted());
  document.getElementById("trustedFilterAuthor").addEventListener("change", () => refreshTrusted());
  document.getElementById("trustedSort").addEventListener("change", () => refreshTrusted());
  document.getElementById("trustedClearFilters").addEventListener("click", () => {
    document.getElementById("trustedSearchInput").value = "";
    document.getElementById("trustedFilterApp").value = "";
    document.getElementById("trustedFilterAuthor").value = "";
    refreshTrusted();
  });
}

async function _loadAllIssues(){
  const items = await api().list_issues();
  if(items && items.apiError){
    if(items.needsLogin) showLoginScreen(items.apiError);
    return [];
  }
  return items || [];
}

async function refreshDashboard(){
  const first = (currentDisplayName || currentUsername || "").split(" ")[0] || "";
  const hour = new Date().getHours();
  const greetWord = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  document.getElementById("dashGreeting").textContent = first ? `${greetWord}, ${first}` : greetWord;
  document.getElementById("dashDate").textContent =
    new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const items = await _loadAllIssues();
  const trusted = items.filter(i => i.status === "solved");
  const pending = items.filter(i => i.status !== "solved" && i.status !== "cancelled");
  const now = new Date();
  const approvedThisMonth = trusted.filter(i => {
    const d = new Date(i.updatedAt || i.createdAt);
    return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const mine = items.filter(i => i.createdBy === currentUsername);

  document.getElementById("statTrusted").textContent = trusted.length;
  document.getElementById("statPending").textContent = pending.length;
  document.getElementById("statApproved").textContent = approvedThisMonth.length;
  document.getElementById("statMine").textContent = mine.length;
  document.getElementById("qaTrustedSub").textContent = `${trusted.length} trusted entries`;
  document.getElementById("qaReviewSub").textContent = pending.length ? `${pending.length} waiting for review` : "Nothing waiting";

  const waitingCard = document.getElementById("waitingReviewCard");
  const sideBadgeReview = document.getElementById("sideBadgeReview");
  if(isAdminOrAbove()){
    waitingCard.style.display = "";
    renderIssueCards(document.getElementById("dashWaitingList"), pending.slice().reverse().slice(0, 5), "Nothing waiting for review.", "review");
    if(sideBadgeReview){ sideBadgeReview.hidden = pending.length === 0; sideBadgeReview.textContent = pending.length > 9 ? "9+" : String(pending.length); }
  } else {
    waitingCard.style.display = "none";
  }
  renderIssueCards(document.getElementById("dashMineList"), mine.slice().reverse().slice(0, 5), "You haven't captured anything yet.");

  const recentlyApproved = trusted.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);
  renderIssueCards(document.getElementById("dashApprovedList"), recentlyApproved, "Nothing has been approved yet.");

  await refreshNotifications();
  renderNotificationPopover("dashNotifList");
}

/* ---- My entries: real status groups. "Draft" is the local, client-only
   capture draft (at most one, never synced to the server). "Changes
   requested" isn't a server status -- it's derived the same way as Review
   Queue's "waiting on author" tab: the most recent audit entry for a
   pending issue is a request_changes with nothing edited since. ---- */
function myEntryBucket(item, latestAuditByIssue){
  if(item.__isDraft) return "draft";
  if(item.status === "solved") return "approved";
  if(item.status === "cancelled") return "rejected";
  const last = latestAuditByIssue.get(item.id);
  if(last && last.action === "request_changes") return "changes";
  return "pending";
}
let _myEntriesCache = [];
let _myEntriesBuckets = new Map();
let _myEntriesTab = "all";
let _myEntriesLatestChange = null;
async function refreshMyEntries(){
  const items = await _loadAllIssues();
  const mine = items.filter(i => i.createdBy === currentUsername)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const audit = await api().list_audit();
  const latestByIssue = new Map();
  if(audit && !audit.apiError){
    audit.slice().reverse().forEach(a => { if(a.issue_id && !latestByIssue.has(a.issue_id)) latestByIssue.set(a.issue_id, a); });
  }

  const draft = loadDraft();
  _myEntriesCache = draft ? [{ __isDraft: true, id: "draft", title: draft.title || "Untitled draft", updatedAt: draft.savedAt }, ...mine] : mine;
  _myEntriesBuckets = new Map(_myEntriesCache.map(i => [i, myEntryBucket(i, latestByIssue)]));

  const counts = { all: mine.length, draft: draft ? 1 : 0, pending: 0, changes: 0, approved: 0, rejected: 0 };
  mine.forEach(i => counts[myEntryBucket(i, latestByIssue)]++);
  document.getElementById("tabCountAll").textContent = counts.all;
  document.getElementById("tabCountDraft").textContent = counts.draft;
  document.getElementById("tabCountPending").textContent = counts.pending;
  document.getElementById("tabCountChanges").textContent = counts.changes;
  document.getElementById("tabCountApproved").textContent = counts.approved;
  document.getElementById("tabCountRejected").textContent = counts.rejected;

  // banner: the single most recent "changes requested" entry, if any
  const changed = mine.filter(i => myEntryBucket(i, latestByIssue) === "changes")
    .sort((a, b) => new Date(latestByIssue.get(b.id).at) - new Date(latestByIssue.get(a.id).at))[0];
  const banner = document.getElementById("myEntriesChangesBanner");
  if(changed){
    const a = latestByIssue.get(changed.id);
    _myEntriesLatestChange = changed;
    banner.style.display = "";
    document.getElementById("myEntriesChangesTitle").textContent = `Changes requested on "${changed.title}"`;
    document.getElementById("myEntriesChangesDetail").textContent = `${a.username}: "${a.detail || ""}"`;
  } else {
    _myEntriesLatestChange = null;
    banner.style.display = "none";
  }

  renderMyEntriesTable();
}
function setMyEntriesTab(tab){
  _myEntriesTab = tab;
  document.querySelectorAll('[data-status-tab]').forEach(el => el.classList.toggle("active", el.dataset.statusTab === tab));
  renderMyEntriesTable();
}
function renderMyEntriesTable(){
  const rows = _myEntriesTab === "all" ? _myEntriesCache : _myEntriesCache.filter(i => _myEntriesBuckets.get(i) === _myEntriesTab);
  const body = document.getElementById("myEntriesBody");
  const empty = document.getElementById("myEntriesEmpty");
  if(!rows.length){
    body.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `<span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("inbox")}</span><b>Nothing here yet</b><span>${_myEntriesTab === "all" ? "Capture your first entry to see it here." : "No entries in this state right now."}</span>`;
    return;
  }
  empty.hidden = true;
  body.innerHTML = rows.map(i => {
    if(i.__isDraft){
      return `
      <tr class="data-row row-list"><td colspan="6">
        <div class="entry-row">
          <span class="entry-tile">${iconSvg("edit")}</span>
          <div class="entry-main">
            <div class="entry-title-line"><b class="entry-title">${escapeHtml(i.title)}</b><span class="status st-draft">Draft</span></div>
            <div class="entry-meta">Saved on this device only${i.updatedAt ? ` <span class="notif-sep">\u00b7</span> ${formatDate(i.updatedAt)}` : ""}</div>
          </div>
          <div class="entry-actions"><button type="button" class="notif-page-action" data-continue-draft="1">Continue <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button></div>
        </div>
      </td></tr>`;
    }
    const bucket = _myEntriesBuckets.get(i);
    const reviewer = (i.status === "solved" || i.status === "cancelled") && i.updatedBy && i.updatedBy !== i.createdBy
      ? escapeHtml(i.updatedBy) : `<span class="muted-small">Not assigned yet</span>`;
    const statusHtml = bucket === "changes"
      ? `<span class="status st-review">Changes requested</span>`
      : `<span class="status ${statusClass(i.status)}">${statusLabel(i.status)}</span>`;
    const tMeta = typeBadgeInfo(i.type);
    return `
    <tr data-id="${escapeAttr(i.id)}" class="data-row row-list"><td colspan="6">
      <div class="entry-row">
        ${typeGlyphHtml(i.type, "entry-tile")}
        <div class="entry-main">
          <div class="entry-title-line"><b class="entry-title">${escapeHtml(i.title)}</b>${statusHtml}</div>
          <div class="entry-meta">${escapeHtml(tMeta.label)} <span class="notif-sep">\u00b7</span> <span class="mono">${escapeHtml(i.id)}</span> <span class="notif-sep">\u00b7</span> ${reviewer} <span class="notif-sep">\u00b7</span> ${formatDate(i.updatedAt || i.createdAt)}</div>
        </div>
        <div class="entry-actions"><button type="button" class="notif-page-action" data-open="${escapeAttr(i.id)}">View <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button></div>
      </div>
    </td></tr>`;
  }).join("");
  body.querySelectorAll("[data-nav-icon]").forEach(el => { el.innerHTML = iconSvg(el.dataset.navIcon); });
  body.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => openDetail(btn.getAttribute("data-open"))));
  body.querySelectorAll("[data-continue-draft]").forEach(btn => btn.addEventListener("click", () => showView("capture")));
}

/* ---- Trusted knowledge: search + filters over solved issues ---- */
async function refreshTrusted(){
  const items = await _loadAllIssues();
  let trusted = items.filter(i => i.status === "solved");

  const appSelect = document.getElementById("trustedFilterApp");
  const authorSelect = document.getElementById("trustedFilterAuthor");
  if(!appSelect.dataset.filled){
    const apps = Array.from(new Set(trusted.map(i => i.system).filter(Boolean))).sort();
    appSelect.innerHTML = '<option value="">Any application</option>' + apps.map(a => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");
    const authors = Array.from(new Set(trusted.map(i => i.createdBy).filter(Boolean))).sort();
    authorSelect.innerHTML = '<option value="">Any author</option>' + authors.map(a => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");
    appSelect.dataset.filled = "1";
  }

  const q = document.getElementById("trustedSearchInput").value.trim().toLowerCase();
  if(q) trusted = trusted.filter(i => (i.title + " " + (i.problem || "") + " " + (i.system || "") + " " + (i.error || "")).toLowerCase().includes(q));
  const appFilter = appSelect.value;
  if(appFilter) trusted = trusted.filter(i => i.system === appFilter);
  const authorFilter = authorSelect.value;
  if(authorFilter) trusted = trusted.filter(i => i.createdBy === authorFilter);

  const sort = document.getElementById("trustedSort").value;
  trusted = trusted.slice().sort((a, b) => sort === "title"
    ? a.title.localeCompare(b.title)
    : new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  document.getElementById("trustedCount").textContent =
    `${trusted.length} validated ${trusted.length === 1 ? "entry" : "entries"}. Every entry here was checked by a reviewer — this is the knowledge the AI Assistant will answer from.`;

  const popRow = document.getElementById("trustedPopularRow");
  const popChips = document.getElementById("trustedPopularChips");
  if(!popChips.dataset.filled){
    const counts = new Map();
    items.filter(i => i.status === "solved").forEach(i => { if(i.system) counts.set(i.system, (counts.get(i.system) || 0) + 1); });
    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([sys]) => sys);
    if(top.length){
      popRow.hidden = false;
      popChips.innerHTML = top.map(s => `<button type="button" class="chip-btn" data-pop-chip="${escapeAttr(s)}">${escapeHtml(s)}</button>`).join("");
      popChips.querySelectorAll("[data-pop-chip]").forEach(btn => btn.addEventListener("click", () => {
        document.getElementById("trustedSearchInput").value = btn.dataset.popChip;
        refreshTrusted();
      }));
    }
    popChips.dataset.filled = "1";
  }

  renderTrustedCards(document.getElementById("trustedList"), trusted);
}
function renderTrustedCards(container, items){
  if(!items.length){
    container.innerHTML = `<div class="table-empty"><span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("inbox")}</span><b>No matching trusted knowledge</b><span>Try a different search term or clear your filters.</span></div>`;
    return;
  }
  container.innerHTML = items.map(i => {
    const type = i.type || "PROBLEM_SOLUTION";
    const descSource = type === "INFORMATION" ? i.description : type === "PROCEDURE" ? i.purpose : i.problem;
    const desc = (descSource || "").length > 160 ? descSource.slice(0, 160) + "…" : (descSource || "");
    const tMeta = typeBadgeInfo(type);
    return `
    <div class="trusted-card" data-open="${escapeAttr(i.id)}">
      ${typeGlyphHtml(type, "entry-type-icon")}
      <div class="trusted-card-body">
        <div class="trusted-card-badges">
          <span class="type-badge">${typeGlyphHtml(type, "type-glyph-sm")} ${escapeHtml(tMeta.label)}</span>
          ${i.system ? `<span class="badge-pill">${escapeHtml(i.system)}</span>` : ""}
          <span class="badge-pill badge-pill-trusted"><span class="icon icon-sm" data-nav-icon="shieldCheck"></span> Trusted</span>
        </div>
        <div class="trusted-card-title">${escapeHtml(i.title)}</div>
        ${desc ? `<div class="trusted-card-desc">${escapeHtml(desc)}</div>` : ""}
        <div class="trusted-card-meta">
          <b>${escapeHtml(i.createdBy || "Unknown")}</b>
          ${i.updatedBy ? ` · <span class="icon icon-sm" data-nav-icon="shieldCheck"></span> Validated ${escapeHtml(formatDate(i.updatedAt))} by ${escapeHtml(i.updatedBy)}` : ""}
        </div>
      </div>
    </div>`;
  }).join("");
  container.querySelectorAll("[data-nav-icon]").forEach(el => { el.innerHTML = iconSvg(el.dataset.navIcon); });
  container.querySelectorAll("[data-open]").forEach(el => el.addEventListener("click", () => openDetail(el.getAttribute("data-open"))));
}

let _rqCache = { pending: [], waiting: [], decided: [] };
let _rqTab = "assigned";
async function refreshReviewQueue(){
  // Show a real loading state immediately -- without this, a slow or
  // failed fetch left the static "—"/"0" placeholders on screen
  // indefinitely, which looks identical to "nothing to review" and was
  // reported several times as "the queue is empty" when it was actually
  // just still loading (or had silently failed).
  const body = document.getElementById("reviewQueueBody");
  const empty = document.getElementById("reviewQueueEmpty");
  body.innerHTML = "";
  empty.hidden = false;
  empty.innerHTML = `<span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("clock")}</span><b>Loading…</b><span>Fetching submissions from the server.</span>`;
  ["rqAssigned", "rqAllPending", "rqOldest", "rqDecided"].forEach(id => { document.getElementById(id).textContent = "…"; });

  let items, audit;
  try {
    items = await _loadAllIssues();
    audit = await api().list_audit();
  } catch(e) {
    empty.innerHTML = `<span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("xMark")}</span><b>Couldn't load the review queue</b><span>${escapeHtml(String((e && e.message) || e))} — try reopening this page.</span>`;
    ["rqAssigned", "rqAllPending", "rqOldest", "rqDecided"].forEach(id => { document.getElementById(id).textContent = "—"; });
    return;
  }
  if(items && items.apiError){
    empty.innerHTML = `<span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("xMark")}</span><b>Couldn't load the review queue</b><span>${escapeHtml(items.apiError)}</span>`;
    ["rqAssigned", "rqAllPending", "rqOldest", "rqDecided"].forEach(id => { document.getElementById(id).textContent = "—"; });
    return;
  }

  const pending = items.filter(i => i.status !== "solved" && i.status !== "cancelled");
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 36e5;
  const decided = items.filter(i => (i.status === "solved" || i.status === "cancelled")
    && new Date(i.updatedAt || i.createdAt).getTime() >= weekAgo);

  // "Waiting on author": the most recent audit entry for a pending issue
  // is a request_changes with nothing edited since. No dedicated status
  // exists for this on the server, so it's derived from the audit log
  // rather than invented.
  let waiting = [];
  if(audit && !audit.apiError && Array.isArray(audit)){
    const latestByIssue = new Map();
    audit.slice().reverse().forEach(a => { if(a.issue_id && !latestByIssue.has(a.issue_id)) latestByIssue.set(a.issue_id, a); });
    waiting = pending.filter(i => { const last = latestByIssue.get(i.id); return last && last.action === "request_changes"; });
  }

  _rqCache = { pending, waiting, decided };

  document.getElementById("rqAssigned").textContent = pending.length;
  document.getElementById("rqAllPending").textContent = pending.length;
  document.getElementById("rqDecided").textContent = decided.length;
  let oldestHours = 0;
  if(pending.length){
    const oldest = pending.reduce((a, b) => new Date(a.createdAt) < new Date(b.createdAt) ? a : b);
    oldestHours = (Date.now() - new Date(oldest.createdAt).getTime()) / 36e5;
    document.getElementById("rqOldest").textContent = waitingSince(oldest.createdAt).replace("Waiting ", "");
  } else {
    document.getElementById("rqOldest").textContent = "—";
  }
  document.getElementById("rqOverTarget").hidden = oldestHours < 48; // 2 days, matching the reference's target window
  document.getElementById("rqTabAssigned").textContent = pending.length;
  document.getElementById("rqTabAll").textContent = pending.length;
  document.getElementById("rqTabWaiting").textContent = waiting.length;
  document.getElementById("rqTabDecided").textContent = decided.length;

  renderReviewQueueTab();
}
function setReviewQueueTab(tab){
  _rqTab = tab;
  document.querySelectorAll('[data-rq-tab]').forEach(el => el.classList.toggle("active", el.dataset.rqTab === tab));
  renderReviewQueueTab();
}
function renderReviewQueueTab(){
  const map = { assigned: _rqCache.pending, all: _rqCache.pending, waiting: _rqCache.waiting, decided: _rqCache.decided };
  let rows = (map[_rqTab] || []).slice().reverse();
  const q = (document.getElementById("rqSearchInput").value || "").trim().toLowerCase();
  if(q) rows = rows.filter(i => (i.title + " " + (i.createdBy || "") + " " + (i.system || "")).toLowerCase().includes(q));
  const sort = document.getElementById("rqSortSelect").value;
  rows.sort((a, b) => sort === "newest"
    ? new Date(b.createdAt) - new Date(a.createdAt)
    : new Date(a.createdAt) - new Date(b.createdAt));
  const emptyText = { assigned: "Nothing waiting for review.", all: "Nothing waiting for review.",
    waiting: "Nothing sent back to an author right now.", decided: "No decisions in the last 7 days." }[_rqTab];

  const body = document.getElementById("reviewQueueBody");
  const empty = document.getElementById("reviewQueueEmpty");
  if(!rows.length){
    body.innerHTML = "";
    empty.hidden = false;
    empty.innerHTML = `<span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("clipboardCheck")}</span><b>Nothing here</b><span>${emptyText}</span>`;
    return;
  }
  empty.hidden = true;
  const beingReviewed = _rqTab === "waiting"; // has a request_changes on it -- "In review", otherwise "Pending review"
  body.innerHTML = rows.map(i => {
    const status = _rqTab === "decided" ? statusLabel(i.status) : (beingReviewed ? "IN REVIEW" : "PENDING REVIEW");
    const statusCls = _rqTab === "decided" ? statusClass(i.status) : (beingReviewed ? "st-inprogress" : "st-review");
    const btnLabel = beingReviewed ? "Continue" : "Review";
    const tMeta = typeBadgeInfo(i.type);
    return `
    <tr class="data-row row-list" data-id="${escapeAttr(i.id)}"><td colspan="6">
      <div class="entry-row">
        ${typeGlyphHtml(i.type, "entry-tile")}
        <div class="entry-main">
          <div class="entry-title-line"><b class="entry-title">${escapeHtml(i.title)}</b><span class="status ${statusCls}">${status}</span></div>
          <div class="entry-meta">${escapeHtml(i.createdBy || "\u2014")} <span class="notif-sep">\u00b7</span> ${escapeHtml(i.system || tMeta.label)} <span class="notif-sep">\u00b7</span> <span class="mono">${escapeHtml(i.id)}</span> <span class="notif-sep">\u00b7</span> ${formatDate(i.createdAt)}</div>
        </div>
        <div class="entry-actions">${_rqTab === "decided"
          ? `<button type="button" class="notif-page-action" data-open="${escapeAttr(i.id)}">View <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button>`
          : `<button type="button" class="notif-page-action notif-page-action-primary" data-open="${escapeAttr(i.id)}">${btnLabel} <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button>`}</div>
      </div>
    </td></tr>`;
  }).join("");
  body.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => openDetail(btn.getAttribute("data-open"))));
}

/* ---- AI Assistant: real lifecycle counts ---- */
async function refreshAiAssistant(){
  const items = await _loadAllIssues();
  const trusted = items.filter(i => i.status === "solved").length;
  const pending = items.filter(i => i.status !== "solved" && i.status !== "cancelled").length;
  document.getElementById("aiStepCapture").textContent = `${items.length} total`;
  document.getElementById("aiStepPending").textContent = `${pending} ${pending === 1 ? "entry" : "entries"}`;
  document.getElementById("aiStepTrusted").textContent = `${trusted} ${trusted === 1 ? "entry" : "entries"}`;
  const first = (currentDisplayName || currentUsername || "").split(" ")[0];
  document.getElementById("aiPreviewName").textContent = first || "there";
}

/* ---- My account ---- */
function setAccountTab(tab){
  document.querySelectorAll('[data-account-tab]').forEach(el => el.classList.toggle("active", el.dataset.accountTab === tab));
  document.querySelectorAll(".account-panel").forEach(el => { el.style.display = el.id === "accountPanel-" + tab ? "" : "none"; });
  if(tab === "activity") refreshActivity();
  if(tab === "notifications") renderNotifPrefs();
}
function refreshMyAccount(){
  const initials = (currentDisplayName || "?").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
  document.getElementById("profileAvatar").textContent = initials || "?";
  document.getElementById("profileName").textContent = currentDisplayName || currentUsername || "—";
  document.getElementById("profileUsername").textContent = "@" + (currentUsername || "—");
  document.getElementById("profileDisplayName").value = currentDisplayName || "";
  document.getElementById("profileUsernameField").value = currentUsername || "";
  document.getElementById("profileRoleText").textContent =
    { technician: "Contributor — capture knowledge and manage your own submissions.",
      admin: "Reviewer — capture, plus review and validate submitted knowledge.",
      super_admin: "Administrator — full platform administration, plus everything a reviewer can do." }[currentRole] || roleLabel(currentRole);
  document.getElementById("cpNewPassword").value = "";
  document.getElementById("cpConfirmPassword").value = "";
  document.getElementById("cpError").style.display = "none";
  document.getElementById("cpSuccess").style.display = "none";
  document.getElementById("prefStartPage").value = getPref("startPage", "dashboard");
  setAccountTab("profile");
}

/* ---- Preferences: device-local only (localStorage), never synced --
   honestly scoped to what a desktop client can actually offer without a
   backend preferences store. ---- */
function getPref(key, fallback){
  try { return localStorage.getItem("rck_pref_" + key) || fallback; } catch(e) { return fallback; }
}
function setPref(key, value){
  try { localStorage.setItem("rck_pref_" + key, value); } catch(e) { /* private mode etc -- non-fatal */ }
}
function applyDensityPref(){
  const density = getPref("density", "comfortable");
  document.body.dataset.density = density;
  document.querySelectorAll(".density-btn").forEach(el => el.classList.toggle("active", el.dataset.density === density));
}

async function refreshActivity(){
  const list = document.getElementById("activityList");
  const audit = await api().list_audit();
  if(!audit || audit.apiError){ list.innerHTML = '<div class="hint" style="padding:10px 0;">Activity isn\'t available to your role.</div>'; return; }
  const mine = audit.filter(a => a.username === currentUsername).slice(0, 25);
  if(!mine.length){ list.innerHTML = '<div class="hint" style="padding:10px 0;">No activity yet.</div>'; return; }
  list.innerHTML = mine.map(a => `
    <div class="user-row">
      <span class="user-row-name">${escapeHtml(HISTORY_ACTION_LABEL[a.action] || a.action.replace(/_/g, " "))}${a.detail ? `: ${escapeHtml(a.detail)}` : ""}</span>
      <span class="muted-small">${formatDate(a.at)}</span>
    </div>`).join("");
}

/* ---- Settings / Administration ---- */
function setSettingsTab(tab){
  document.querySelectorAll('[data-settings-tab]').forEach(el => el.classList.toggle("active", el.dataset.settingsTab === tab));
  document.querySelectorAll(".settings-panel").forEach(el => { el.style.display = el.id === "settingsPanel-" + tab ? "" : "none"; });
}
async function refreshSettingsView(){
  setSettingsTab("users");
  await openManageUsers();
  const items = await _loadAllIssues();
  document.getElementById("statsTrusted").textContent = items.filter(i => i.status === "solved").length;
  document.getElementById("statsPending").textContent = items.filter(i => i.status !== "solved" && i.status !== "cancelled").length;
  document.getElementById("statsRejected").textContent = items.filter(i => i.status === "cancelled").length;
  const users = await api().list_users();
  document.getElementById("statsUsers").textContent = (users && !users.apiError) ? users.length : "—";
}

let _notifPageTab = "all";
async function refreshNotifPage(){
  await refreshNotifications();
  renderNotifPageGrouped(_notifPageTab);
}
function setNotifPageTab(tab){
  _notifPageTab = tab;
  document.querySelectorAll('[data-notif-tab]').forEach(el => el.classList.toggle("active", el.dataset.notifTab === tab));
  renderNotifPageGrouped(_notifPageTab);
}
function dayBucketLabel(iso){
  const d = new Date(iso);
  const now = new Date();
  const startOf = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 864e5);
  if(diffDays <= 0) return "Today";
  if(diffDays === 1) return "Yesterday";
  if(diffDays <= 7) return "Earlier this week";
  return "Older";
}
const NOTIF_CATEGORY_META = {
  reviews: { label: "Review", pillClass: "notif-pill-indigo" },
  mine: { label: "My entries", pillClass: "notif-pill-green" },
  kb: { label: "Knowledge base", pillClass: "notif-pill-blue" },
};
// Single source of truth for every notification surface (bell popover,
// dashboard widget, full Notifications page) -- these used to be built by
// two separate, drifting code paths, which is how the popover silently
// kept its old row design after the page was redesigned.

const NOTIF_PREF_ROWS = [
  { key: "reviews", icon: "clipboardCheck", color: "indigo", title: "Review assignments", tag: "Reviewers", desc: "Password requests and other items assigned to you for action.", reviewersOnly: true },
  { key: "mine", icon: "fileText", color: "green", title: "My entry updates", desc: "Changes requested, approvals and other updates on your entries." },
  { key: "kb", icon: "shieldCheck", color: "teal", title: "Trusted knowledge updates", desc: "New entries added to the knowledge base." },
];
function _prefStoreKey(){ return "rck.notifPrefs." + (currentUsername || "anon"); }
function loadNotifPrefs(){
  try { return Object.assign({ reviews: true, mine: true, kb: true }, JSON.parse(localStorage.getItem(_prefStoreKey()) || "{}")); }
  catch(e){ return { reviews: true, mine: true, kb: true }; }
}
function saveNotifPref(key, on){
  const p = loadNotifPrefs(); p[key] = on;
  try { localStorage.setItem(_prefStoreKey(), JSON.stringify(p)); } catch(e){}
}
function renderNotifPrefs(){
  const el = document.getElementById("notifPrefsTable");
  if(!el) return;
  const prefs = loadNotifPrefs();
  const rows = NOTIF_PREF_ROWS.filter(r => !r.reviewersOnly || isAdminOrAbove());
  el.innerHTML = `<div class="notif-prefs-cols"><span>Notification</span><span>In-app</span></div>` + rows.map(r => `
    <div class="notif-prefs-row">
      <span class="notif-icon notif-icon-tile notif-icon-${r.color}">${iconSvg(r.icon)}</span>
      <div class="notif-prefs-text"><b>${r.title}</b>${r.tag ? `<span class="notif-pill notif-pill-gray">${r.tag}</span>` : ""}<div class="muted-small">${r.desc}</div></div>
      <label class="switch"><input type="checkbox" data-pref="${r.key}" ${prefs[r.key] ? "checked" : ""}><span class="switch-track"></span></label>
    </div>`).join("");
  el.querySelectorAll("[data-pref]").forEach(cb => cb.addEventListener("change", () => {
    saveNotifPref(cb.dataset.pref, cb.checked);
    refreshNotifBadgesOnly();
  }));
}

function initialsOf(name){
  const parts = String(name || "?").trim().split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map(p => p[0]).join("") || "?").toUpperCase();
}
// Direct notifications are free text from the server; classify them once here
// so the list, the popover and the toast all agree on type, title and icon.
function classifyDirect(n){
  const msg = String(n.message || "");
  let m = msg.match(/^(.+?) requested changes on "(.*?)": ([\s\S]*)$/);
  if(m) return { type: "changes", actor: m[1], entry: m[2], title: "Changes requested", icon: "fileText", color: "amber",
    toastBody: `${escapeHtml(m[1])} asked for changes to <q>${escapeHtml(m[2])}</q>.`, act: "See feedback" };
  m = msg.match(/^(.+?) changed the status of "(.*?)" to (.+)$/);
  if(m){
    const st = m[3].trim().toLowerCase();
    if(st === "solved") return { type: "approved", actor: m[1], entry: m[2], title: "Entry approved", icon: "fileText", color: "green",
      toastBody: `Your entry <q>${escapeHtml(m[2])}</q> is now approved.`, act: "View entry" };
    if(st === "critical") return { type: "urgent", actor: m[1], entry: m[2], title: "Entry marked critical", icon: "fileText", color: "red", sticky: true,
      toastBody: `<q>${escapeHtml(m[2])}</q> was marked Critical by ${escapeHtml(m[1])}.`, act: "Open entry" };
    if(st === "cancelled") return { type: "changes", actor: m[1], entry: m[2], title: "Entry not accepted", icon: "fileText", color: "amber",
      toastBody: `<q>${escapeHtml(m[2])}</q> was closed without publishing.`, act: "See feedback" };
    return { type: "default", actor: m[1], entry: m[2], title: "Status updated", icon: "fileText", color: "blue",
      toastBody: `<q>${escapeHtml(m[2])}</q> is now ${escapeHtml(m[3])}.`, act: "View entry" };
  }
  return { type: "default", actor: "", entry: "", title: "Update", icon: "bell", color: "blue", toastBody: escapeHtml(msg), act: "View details" };
}
function buildNotifItems(category){
  const { pending, newIssues, resolvedRequests, direct } = _lastNotifications;
  const items = [];
  pending.forEach(r => items.push({ icon: "clipboardCheck", colorClass: "indigo", time: r.requested_at, cat: "reviews",
    title: "Password change requested",
    body: `${escapeHtml(r.username)} requested a password change.`,
    actionLabel: "Review", onClick: () => openManageUsers(),
    toast: { type: "review", tag: "Review", actor: r.username, title: "Password change requested",
      body: `<q>${escapeHtml(r.username)}</q> asked for a password change.`, act: "Review now" } }));
  direct.forEach(n => {
    const c = classifyDirect(n);
    items.push({ icon: c.icon, colorClass: c.color, time: n.created_at, cat: "mine", ref: n.issue_id || "",
      title: c.title, body: escapeHtml(n.message),
      actionLabel: n.issue_id ? c.act : null, onClick: n.issue_id ? () => openDetail(n.issue_id, c.type === "changes") : null,
      toast: { type: c.type, tag: c.type === "urgent" ? "Critical" : ({ changes: "Changes", approved: "Approved" }[c.type] || "Update"),
        actor: c.actor, title: c.title, body: c.toastBody, act: c.act, sticky: !!c.sticky } });
  });
  resolvedRequests.forEach(r => {
    const ok = r.status === "approved";
    items.push({ icon: "check", colorClass: ok ? "green" : "red", time: r.reviewed_at, cat: "mine",
      title: ok ? "Password change approved" : "Password change rejected",
      body: `Your password change was ${escapeHtml(r.status)}.`,
      toast: { type: ok ? "approved" : "changes", tag: ok ? "Approved" : "Changes", actor: "Admin",
        title: ok ? "Password change approved" : "Password change rejected",
        body: `Your password change request was <q>${escapeHtml(r.status)}</q>.`, act: "View details" } });
  });
  newIssues.forEach(i => {
    const reviewer = isAdminOrAbove();
    items.push({ icon: reviewer ? "clipboardCheck" : "shieldCheck", colorClass: reviewer ? "indigo" : "teal", time: i.created_at,
      cat: reviewer ? "reviews" : "kb", ref: i.id,
      title: reviewer ? "New review assigned" : "New knowledge entry",
      body: reviewer ? `${escapeHtml(i.created_by)} submitted "${escapeHtml(i.title)}" for your review.` : `${escapeHtml(i.created_by)} added "${escapeHtml(i.title)}".`,
      actionLabel: reviewer ? "Review entry" : "View entry", onClick: () => openDetail(i.id),
      toast: reviewer
        ? { type: "review", tag: "Review", actor: i.created_by, title: "New review assigned",
            body: `${escapeHtml(i.created_by)} submitted <q>${escapeHtml(i.title)}</q> for your review.`, act: "Review now" }
        : { type: "default", tag: "Knowledge base", actor: i.created_by, title: "New knowledge entry",
            body: `${escapeHtml(i.created_by)} added <q>${escapeHtml(i.title)}</q>.`, act: "View entry" } });
  });
  items.sort((a, b) => new Date(b.time) - new Date(a.time));
  const prefs = loadNotifPrefs();
  const deleted = _loadDeletedSet();
  return items.filter(i => prefs[i.cat] !== false && !deleted.has(notifKey(i))
    && (category === "all" || i.cat === category));
}

/* ---- Real-time toast (reference "Notification pop-out"): four trigger types ---- */
const TOAST_ICONS = {
  review: '<path d="M3 6h13M3 12h9M3 18h7"/><circle cx="17" cy="16" r="3"/><path d="m21 20-1.8-1.8"/>',
  approved: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
  changes: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  urgent: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  default: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
};
const TOAST_CLASS = { review: "v", approved: "g", changes: "a", urgent: "r", default: "" };
const TOAST_ACTOR_COLOR = { review: "#7c5ce0", approved: "#0e9f6e", changes: "#d97706", urgent: "#c2261b", default: "#1d4ed8" };
const TOAST_MS = 6000;
let _toastQueue = [];
let _newNotifKeys = new Set();
const isMobileToast = () => window.matchMedia && window.matchMedia("(max-width: 767px)").matches;
const toastMax = () => isMobileToast() ? 1 : 3;
const visibleToasts = () => Array.from(document.querySelectorAll("#notifToasts .ntoast:not(.out)"));

function resetNotifToastState(){
  _notifsInitialized = false; _toastedKeys.clear(); _toastQueue = []; _newNotifKeys.clear();
  const box = document.getElementById("notifToasts"); if(box) box.innerHTML = "";
}
function ringBell(){
  const els = [document.getElementById("notifBtn"), document.getElementById("notifBadge"), document.getElementById("sideBadgeNotif")];
  els.forEach(e => { if(e){ e.classList.remove("bell-ring", "badge-pop"); void e.offsetWidth; } });
  if(els[0]) els[0].classList.add("bell-ring");
  if(els[1]) els[1].classList.add("badge-pop");
  if(els[2]) els[2].classList.add("badge-pop");
}
function renderToastMore(){
  const box = document.getElementById("notifToasts");
  let more = box.querySelector(".ntoast-more");
  if(!_toastQueue.length){ if(more) more.remove(); return; }
  if(!more){
    more = document.createElement("button");
    more.type = "button"; more.className = "ntoast-more";
    more.addEventListener("click", () => {
      _toastQueue = []; renderToastMore();
      document.getElementById("notifBtn").click();
    });
    box.appendChild(more);
  }
  more.innerHTML = `<span class="c">+${_toastQueue.length}</span> more new notification${_toastQueue.length > 1 ? "s" : ""}`;
}
function showNotifToast(item){
  if(visibleToasts().length >= toastMax()){
    if(isMobileToast()){ visibleToasts().forEach(closeNotifToast); }   // mobile: one at a time, newest replaces
    else { _toastQueue.push(item); renderToastMore(); return; }
  }
  makeNotifToast(item);
}
function makeNotifToast(item){
  const d = item.toast || { type: "default", tag: "Update", title: item.title, body: item.body, act: "View details", actor: "" };
  const box = document.getElementById("notifToasts");
  const el = document.createElement("div");
  el.className = "ntoast " + (TOAST_CLASS[d.type] || "");
  el.setAttribute("role", d.sticky ? "alert" : "status");
  el.tabIndex = 0;
  el.innerHTML = `
    <div class="nt-ic"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TOAST_ICONS[d.type] || TOAST_ICONS.default}</svg>${d.actor ? `<span class="who" style="background:${TOAST_ACTOR_COLOR[d.type] || TOAST_ACTOR_COLOR.default}">${escapeHtml(initialsOf(d.actor))}</span>` : ""}</div>
    <div>
      <div class="nt-meta">${d.sticky ? '<span class="nt-urgent">Urgent</span>' : ""}<span class="nt-tag">${escapeHtml(d.tag || "Update")}</span><span class="nt-sep"></span><span>now</span></div>
      <div class="nt-title">${escapeHtml(d.title)}</div>
      <div class="nt-body">${d.body}</div>
      <div class="nt-act"><button type="button" class="p">${escapeHtml(d.act || "View details")}</button><button type="button" class="s">Dismiss</button></div>
    </div>
    <button type="button" class="nt-x" aria-label="Dismiss notification"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
    ${d.sticky ? "" : `<div class="nt-bar"><i style="animation-duration:${TOAST_MS}ms"></i></div>`}`;
  box.prepend(el);
  el.querySelector(".nt-x").addEventListener("click", e => { e.stopPropagation(); closeNotifToast(el); });
  el.querySelector(".s").addEventListener("click", e => { e.stopPropagation(); closeNotifToast(el); });
  el.querySelector(".p").addEventListener("click", e => {
    e.stopPropagation(); closeNotifToast(el);
    setNotifRead([item], true); refreshNotifBadgesOnly();
    if(item.onClick) item.onClick(); else openNotificationDetail(item);
  });
  el.addEventListener("click", () => { closeNotifToast(el); openNotificationDetail(item); });
  const bar = el.querySelector(".nt-bar i");
  if(bar) bar.addEventListener("animationend", () => closeNotifToast(el));
  // swipe (up or sideways) to dismiss
  let sx = 0, sy = 0, dragging = false;
  el.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; dragging = true; });
  el.addEventListener("pointermove", e => {
    if(!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if(isMobileToast()) el.style.transform = `translate(${dx}px, ${Math.min(0, dy)}px)`;
  });
  const end = e => {
    if(!dragging) return; dragging = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if(isMobileToast() && (Math.abs(dx) > 60 || dy < -40)) closeNotifToast(el);
    else el.style.transform = "";
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}
function closeNotifToast(el){
  if(!el || el.classList.contains("out")) return;
  el.classList.add("out");
  setTimeout(() => {
    el.remove();
    if(_toastQueue.length && visibleToasts().length < toastMax()){ makeNotifToast(_toastQueue.shift()); renderToastMore(); }
    else renderToastMore();
  }, 240);
}
// Called with brand-new, unread notifications only (never the backlog at login).
function handleFreshNotifications(fresh){
  if(!fresh.length) return;
  ringBell();
  fresh.forEach(i => _newNotifKeys.add(notifKey(i)));
  const pop = document.getElementById("notifPopover");
  const popOpen = pop && pop.classList.contains("open");
  const onList = (document.querySelector(".view.active") || {}).id === "view-notifications";
  if(popOpen) renderNotificationPopover();          // the item slides into the list instead of a toast
  if(onList) renderNotifPageGrouped(_notifPageTab); // list updates in place with a "New" marker
  if(popOpen || onList) return;
  fresh.slice().reverse().forEach(showNotifToast);  // oldest first, so the newest ends up on top
}

/* ---- Notification detail (reference "Notification Detail" page) ---- */
let _notifDetailItem = null;
const NOTIF_WHY = {
  reviews: "You are an authorized reviewer, so requests that need a decision reach you.",
  mine: "This is an update on something you captured or requested.",
  kb: "New knowledge entries are shared with everyone in the knowledge base.",
};
async function openNotificationDetail(item){
  _notifDetailItem = item;
  _newNotifKeys.delete(notifKey(item));
  setNotifRead([item], true);
  refreshNotifBadgesOnly();
  await showView("notification-detail");
  await renderNotificationDetail();
}
async function renderNotificationDetail(){
  const item = _notifDetailItem;
  const root = document.getElementById("notifDetailBody");
  if(!item){ showView("notifications"); return; }
  const meta = NOTIF_CATEGORY_META[item.cat];
  const read = isNotifRead(item);
  const received = new Date(item.time);
  const receivedText = isNaN(received) ? "" : received.toLocaleString([], { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  let issue = null;
  if(item.ref){
    const all = await _loadAllIssues();
    issue = all.find(i => i.id === item.ref) || null;
  }
  const solved = issue && issue.status === "solved";
  const cancelled = issue && issue.status === "cancelled";
  const decided = solved || cancelled;
  const t = issue ? typeBadgeInfo(issue.type) : null;

  const relatedCard = issue ? `
    <div class="nd-section-label">Related entry</div>
    <div class="nd-entry" data-nd-entry>
      ${typeGlyphHtml(issue.type, "entry-tile")}
      <div class="nd-entry-main">
        <div class="entry-title-line"><b class="entry-title">${escapeHtml(issue.title)}</b><span class="mono muted-small">${escapeHtml(issue.id)}</span></div>
        <div class="entry-meta"><span class="status ${statusClass(issue.status)}">${statusLabel(issue.status)}</span> <span class="notif-sep">\u00b7</span> ${escapeHtml(t.label)} <span class="notif-sep">\u00b7</span> ${escapeHtml(issue.createdBy || "\u2014")}</div>
      </div>
      <span class="icon icon-sm">${iconSvg("arrowRight")}</span>
    </div>` : "";

  const step = (state, title, text) => `
    <li class="nd-step nd-step-${state}"><span class="nd-step-dot"></span><div><b>${title}</b><div class="muted-small">${text}</div></div></li>`;
  const timeline = issue ? `
    <div class="card nd-side-card">
      <h3>Where this entry is</h3>
      <ol class="nd-steps">
        ${step("done", "Capture", `Submitted by ${escapeHtml(issue.createdBy || "\u2014")} \u00b7 ${escapeHtml(formatDate(issue.createdAt))}`)}
        ${step(decided ? "done" : "current", "Review", decided ? `Reviewed by ${escapeHtml(issue.updatedBy || "a reviewer")}` : "Waiting for a reviewer")}
        ${step(decided ? "done" : "todo", "Validate", solved ? "Validated" : cancelled ? "Not accepted" : "After the review is approved")}
        ${step(solved ? "done" : "todo", "Trusted knowledge", solved ? "Published to the knowledge base" : "Published once validated")}
      </ol>
    </div>` : "";

  root.innerHTML = `
    <div class="nd-grid">
      <div class="card nd-main">
        <div class="nd-head">
          <span class="notif-pill ${meta.pillClass}">${meta.label}</span>
          <span class="nd-time">${escapeHtml(receivedText)}</span>
          <span class="nd-read-chip ${read ? "" : "nd-unread"}">${read ? "Read" : "Unread"}</span>
        </div>
        <h2 class="nd-title">${escapeHtml(item.title)}</h2>
        <p class="nd-message">${item.body}</p>
        ${relatedCard}
        <div class="nd-actions">
          ${item.actionLabel && item.onClick ? `<button type="button" class="btn btn-primary" id="ndPrimary">${escapeHtml(item.actionLabel)} <span class="icon icon-white icon-sm">${iconSvg("arrowRight")}</span></button>` : ""}
          <button type="button" class="btn btn-secondary" id="ndToggleRead">${read ? "Mark as unread" : "Mark as read"}</button>
          <button type="button" class="btn btn-secondary nd-delete" id="ndDelete">Delete notification</button>
        </div>
      </div>
      <div class="nd-side">
        ${timeline}
        <div class="card nd-side-card">
          <h3>About this notification</h3>
          <dl class="nd-about">
            <dt>Type</dt><dd>${meta.label} \u00b7 ${escapeHtml(item.title)}</dd>
            <dt>Received</dt><dd>${escapeHtml(receivedText)}</dd>
            <dt>Delivered</dt><dd>In-app</dd>
            <dt>Why you got this</dt><dd>${NOTIF_WHY[item.cat] || ""}</dd>
          </dl>
          <a class="nd-prefs-link" id="ndPrefs">Manage notification preferences</a>
        </div>
      </div>
    </div>`;

  const back = () => showView("notifications");
  const primary = document.getElementById("ndPrimary");
  if(primary) primary.addEventListener("click", () => { item.onClick(); });
  document.getElementById("ndToggleRead").addEventListener("click", () => {
    setNotifRead([item], !isNotifRead(item)); refreshNotifBadgesOnly(); renderNotificationDetail();
  });
  document.getElementById("ndDelete").addEventListener("click", () => { deleteNotif(item); refreshNotifBadgesOnly(); back(); });
  document.getElementById("ndPrefs").addEventListener("click", () => { showView("my-account"); setAccountTab("notifications"); });
  const entry = root.querySelector("[data-nd-entry]");
  if(entry) entry.addEventListener("click", () => openDetail(item.ref));
}

let _notifReadFilter = "all";
function renderNotifPageGrouped(category){
  const list = document.getElementById("notifPageList");
  const all = buildNotifItems(category);
  const unreadN = all.filter(i => !isNotifRead(i)).length;
  const items = all.filter(i => _notifReadFilter === "all" ? true : _notifReadFilter === "unread" ? !isNotifRead(i) : isNotifRead(i));

  document.getElementById("tabCountNotifAll").textContent = buildNotifItems("all").length;
  document.getElementById("tabCountNotifReviews").textContent = buildNotifItems("reviews").length;
  document.getElementById("tabCountNotifMine").textContent = buildNotifItems("mine").length;
  document.getElementById("tabCountNotifKb").textContent = buildNotifItems("kb").length;
  const unreadLbl = document.getElementById("notifSegUnreadCount");
  if(unreadLbl) unreadLbl.textContent = unreadN;
  const countLbl = document.getElementById("notifTotalLabel");
  const newN = items.filter(i => !isNotifRead(i) && _newNotifKeys.has(notifKey(i))).length;
  if(countLbl) countLbl.textContent = `${items.length} notification${items.length === 1 ? "" : "s"}${newN ? ` \u00b7 ${newN} new` : ""}`;
  document.querySelectorAll("[data-notif-seg]").forEach(el => el.classList.toggle("active", el.dataset.notifSeg === _notifReadFilter));

  if(!items.length){
    list.innerHTML = `<div class="table-empty"><span class="icon icon-muted" style="width:32px;height:32px;">${iconSvg("bell")}</span><b>${_notifReadFilter === "unread" ? "No unread notifications" : "You're all caught up"}</b><span>New reviews and updates on your entries will appear here.</span></div>`;
    return;
  }
  let html = "";
  let lastBucket = null;
  items.forEach((item, idx) => {
    const bucket = dayBucketLabel(item.time);
    if(bucket !== lastBucket){ html += `<div class="notif-day-label">${bucket}</div>`; lastBucket = bucket; }
    const catMeta = NOTIF_CATEGORY_META[item.cat];
    const read = isNotifRead(item);
    html += `
      <div class="notif-page-row${read ? "" : " unread"}" data-row="${idx}">
        <span class="notif-dot-col">${read ? "" : `<span class="notif-dot" aria-label="Unread"></span>`}</span>
        <span class="notif-icon notif-icon-tile notif-icon-${item.colorClass}">${iconSvg(item.icon)}</span>
        <div class="notif-page-body">
          <div class="notif-page-title-row">
            <b class="notif-page-title">${escapeHtml(item.title)}</b>
            <span class="notif-pill ${catMeta.pillClass}">${catMeta.label}</span>
            ${(!read && _newNotifKeys.has(notifKey(item))) ? '<span class="notif-new">New</span>' : ""}
          </div>
          <div class="notif-page-text">${item.body}</div>
          <div class="notif-page-meta"><span class="icon icon-sm">${iconSvg("clock")}</span>${notifMeta(item.time)}${item.ref ? ` <span class="notif-sep">\u00b7</span> ${escapeHtml(item.ref)}` : ""}</div>
        </div>
        <div class="notif-page-actions">
          ${item.actionLabel ? `<button type="button" class="notif-page-action">${escapeHtml(item.actionLabel)} <span class="icon icon-sm">${iconSvg("arrowRight")}</span></button>` : ""}
          <span class="notif-menu-wrap">
            <button type="button" class="notif-more" aria-label="More actions" data-more="${idx}"><span class="icon icon-sm">${iconSvg("dots")}</span></button>
            <div class="notif-menu" data-menu="${idx}" hidden>
              <button type="button" data-toggle-read="${idx}">${read ? "Mark as unread" : "Mark as read"}</button>
              <button type="button" data-open="${idx}">Open details</button>
              <button type="button" class="notif-menu-danger" data-delete="${idx}">Delete notification</button>
            </div>
          </span>
        </div>
      </div>`;
  });
  list.innerHTML = html;
  const rerender = () => { renderNotifPageGrouped(_notifPageTab); refreshNotifBadgesOnly(); };
  list.querySelectorAll(".notif-page-action").forEach(btn => {
    const idx = Number(btn.closest(".notif-page-row").dataset.row);
    btn.addEventListener("click", () => { setNotifRead([items[idx]], true); if(items[idx].onClick) items[idx].onClick(); rerender(); });
  });
  list.querySelectorAll("[data-more]").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    const menu = list.querySelector(`[data-menu="${btn.dataset.more}"]`);
    const wasHidden = menu.hidden;
    list.querySelectorAll(".notif-menu").forEach(m => m.hidden = true);
    menu.hidden = !wasHidden;
  }));
  list.querySelectorAll("[data-toggle-read]").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    const item = items[Number(btn.dataset.toggleRead)];
    setNotifRead([item], !isNotifRead(item)); rerender();
  }));
  list.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    openNotificationDetail(items[Number(btn.dataset.open)]);
  }));
  list.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", e => {
    e.stopPropagation();
    deleteNotif(items[Number(btn.dataset.delete)]); rerender();
  }));
  list.querySelectorAll(".notif-page-row").forEach(row => row.addEventListener("click", e => {
    if(e.target.closest(".notif-page-actions")) return;
    openNotificationDetail(items[Number(row.dataset.row)]);
  }));
}
document.addEventListener("click", () => document.querySelectorAll(".notif-menu").forEach(m => m.hidden = true));

/* ============================== wiring ============================== */
function wireEvents(){
  ["fProblem","fRoot","fSolution"].forEach(id=>{
    document.getElementById(id).addEventListener("input", e=>{
      const map = {fProblem:"cProblem", fRoot:"cRoot", fSolution:"cSolution"};
      document.getElementById(map[id]).textContent = e.target.value.length;
    });
  });

  mainAppsPicker = createAppsPicker({
    pickerEl: document.getElementById("appsPicker"),
    chipsEl: document.getElementById("appChips"),
    toggleEl: document.getElementById("appsPickerToggle"),
    dropdownEl: document.getElementById("appsDropdown"),
    getSelected: () => currentApps,
    onChange: (next) => { currentApps = next; scheduleDraftSave(); },
  });
  infoAppsPicker = createAppsPicker({
    pickerEl: document.getElementById("infoAppsPicker"),
    chipsEl: document.getElementById("infoAppChips"),
    toggleEl: document.getElementById("infoAppsPickerToggle"),
    dropdownEl: document.getElementById("infoAppsDropdown"),
    getSelected: () => currentInfoApps,
    onChange: (next) => { currentInfoApps = next; },
  });
  procAppsPicker = createAppsPicker({
    pickerEl: document.getElementById("procAppsPicker"),
    chipsEl: document.getElementById("procAppChips"),
    toggleEl: document.getElementById("procAppsPickerToggle"),
    dropdownEl: document.getElementById("procAppsDropdown"),
    getSelected: () => currentProcApps,
    onChange: (next) => { currentProcApps = next; },
  });

  document.getElementById("addStepBtn").addEventListener("click", () => addStep(document.getElementById("stepsBody")));
  document.getElementById("eAddStepBtn").addEventListener("click", () => addStep(document.getElementById("eStepsBody")));
  document.getElementById("epAddStepBtn").addEventListener("click", () => addStep(document.getElementById("epStepsBody")));
  document.getElementById("addProcStepBtn").addEventListener("click", () => addStep(document.getElementById("procStepsBody")));

  document.getElementById("iDescription").addEventListener("input", e => {
    document.getElementById("cIDescription").textContent = e.target.value.length;
  });

  document.getElementById("submitInfoBtn").addEventListener("click", submitInformation);
  document.getElementById("clearInfoBtn").addEventListener("click", clearInfoForm);
  document.getElementById("captureInfoChangeTypeLink").addEventListener("click", e => { e.preventDefault(); showCaptureTypeStep(); });

  document.getElementById("submitProcBtn").addEventListener("click", submitProcedure);
  document.getElementById("clearProcBtn").addEventListener("click", clearProcForm);
  document.getElementById("captureProcChangeTypeLink").addEventListener("click", e => { e.preventDefault(); showCaptureTypeStep(); });

  document.querySelectorAll("[data-capture-type]").forEach(el => {
    el.addEventListener("click", () => showCaptureFormStep(el.dataset.captureType));
  });
  document.getElementById("captureChangeTypeLink").addEventListener("click", e => { e.preventDefault(); showCaptureTypeStep(); });
  document.getElementById("contributionGuidelinesLink").addEventListener("click", () => showToast(
    "Contribution guidelines", "Be specific and reproducible, avoid sensitive data, and check for an existing entry before capturing a new one."));
  ["fTitle","fError","fProblem","fRoot","fSolution"].forEach(id => {
    document.getElementById(id).addEventListener("input", scheduleDraftSave);
  });
  document.getElementById("stepsBody").addEventListener("input", scheduleDraftSave);

  document.querySelectorAll("#captureCard .attach-box").forEach(btn => {
    btn.addEventListener("click", () => stageAttachment(btn.getAttribute("data-kind")));
  });

  document.getElementById("submitBtn").addEventListener("click", () => submitIssue("review"));
  document.getElementById("clearBtn").addEventListener("click", clearForm);
  document.getElementById("similarBtn").addEventListener("click", () => {
    const title = document.getElementById("fTitle").value.trim();
    renderList(title);
  });
  document.getElementById("searchKbBtn").addEventListener("click", () => {
    showView("trusted");
  });

  document.getElementById("viewAllLink").addEventListener("click", openViewAll);
  document.getElementById("viewAllCloseBtn").addEventListener("click", () => closeOverlay("viewAllOverlay"));

  document.getElementById("dEditBtn").addEventListener("click", showDetailEdit);
  document.getElementById("dSaveBtn").addEventListener("click", saveDetailEdit);
  document.getElementById("dCancelBtn").addEventListener("click", showDetailView);
  document.getElementById("dCloseBtn").addEventListener("click", closeDetail);
  document.querySelectorAll('#reviewBar input[name=reviewDecision]').forEach(r => r.addEventListener("change", updateReviewDecisionUI));
  document.getElementById("reviewSubmitBtn").addEventListener("click", submitReviewDecision);
  document.getElementById("reviewSaveLaterBtn").addEventListener("click", reviewSaveForLater);

  document.getElementById("addAppConfirmBtn").addEventListener("click", confirmAddApp);
  document.getElementById("addAppCancelBtn").addEventListener("click", cancelAddApp);
  document.getElementById("addAppCloseBtn").addEventListener("click", cancelAddApp);
  document.getElementById("newAppInput").addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); confirmAddApp(); } });

  const notifBtn = document.getElementById("notifBtn");
  const notifPop = document.getElementById("notifPopover");
  notifBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const opening = !notifPop.classList.contains("open");
    notifPop.classList.toggle("open");
    if(opening){
      renderNotificationPopover(); // show current (possibly slightly stale) data instantly
      await refreshNotifications();
      renderNotificationPopover(); // then refresh with the latest
      // Only the FYI items (new issues, resolved requests) are "seen" by
      // opening this -- pending password requests stay badge-worthy until
      // actually approved/rejected, so this doesn't touch that count.
      if(_lastNotifications.newIssues.length || _lastNotifications.resolvedRequests.length){
        await api().mark_notifications_seen();
      }
    }
  });
  document.addEventListener("click", () => notifPop.classList.remove("open"));

  document.getElementById("cpRequestBtn").addEventListener("click", submitPasswordChangeRequest);

  document.getElementById("confirmCancelBtn").addEventListener("click", () => _closeConfirmDialog(false));
  document.getElementById("confirmActionBtn").addEventListener("click", () => _closeConfirmDialog(true));

  document.getElementById("signOutBtn").addEventListener("click", async () => {
    document.getElementById("accountMenu").classList.remove("open");
    const ok = await confirmDialog({
      icon: "signOut", iconClass: "neutral", title: "Sign out of RCK?",
      text: "You'll need to sign in again to continue.", actionLabel: "Sign out", actionClass: "btn-danger",
    });
    if(!ok) return;
    if(_notifPollId){ clearInterval(_notifPollId); _notifPollId = null; }
    await api().logout();
    resetNotifToastState();
    showLoginScreen();
  });

  document.getElementById("nuCreateBtn").addEventListener("click", submitCreateUser);

  ["detailOverlay","addAppOverlay","viewAllOverlay","confirmOverlay"].forEach(id => {
    document.getElementById(id).addEventListener("click", (e) => {
      if(e.target.id === id){
        if(id === "addAppOverlay") cancelAddApp();
        else if(id === "confirmOverlay") _closeConfirmDialog(false);
        else closeOverlay(id);
      }
    });
  });

  document.addEventListener("keydown", e => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
      e.preventDefault();
      showView("trusted");
      document.getElementById("trustedSearchInput").focus();
      return;
    }
    if(e.key === "Escape"){
      if(document.getElementById("addAppOverlay").classList.contains("open")){ cancelAddApp(); return; }
      if(document.getElementById("confirmOverlay").classList.contains("open")){ _closeConfirmDialog(false); return; }
      const top = topOpenOverlay();
      if(top) closeOverlay(top.id);
    }
  });
}

async function loadApplications(){
  allApps = await api().list_applications();
  refreshAllAppWidgets();
}

/* ============================== login gate ============================== */
function showLoginScreen(message){
  document.getElementById("loginScreen").classList.add("open");
  // .app-shell sits behind the login overlay but stays in normal document
  // flow (it's not display:none), so its own height -- easily several
  // screens tall once real data is loaded -- was making <body> scrollable
  // even though the fixed-position login screen itself fit in one viewport.
  document.body.classList.add("login-open");
  const errEl = document.getElementById("loginError");
  if(message){ errEl.textContent = message; errEl.style.display = ""; }
  else { errEl.style.display = "none"; }
  document.getElementById("loginPassword").value = "";
  setTimeout(() => document.getElementById("loginUsername").focus(), 0);
}
function hideLoginScreen(){
  document.getElementById("loginScreen").classList.remove("open");
  document.body.classList.remove("login-open");
}

async function attemptLogin(){
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  if(!username || !password){
    errEl.textContent = "Enter both a username and password.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("loginSubmitBtn");
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Signing in…";
  const result = await api().login(username, password);
  btn.disabled = false;
  btn.textContent = originalLabel;
  if(result && result.apiError){
    if(/^Could not reach the server/.test(result.apiError)){
      errEl.textContent = "Can't reach the server. It may have moved to a new address. Enter the current address below.";
      errEl.title = result.apiError;
      await showConnectionRecovery();
    } else {
      errEl.textContent = result.apiError;
      errEl.title = "";
    }
    errEl.style.display = "";
    return;
  }
  hideLoginScreen();
  await completeInit();
}

async function showConnectionRecovery(){
  const box = document.getElementById("loginRecover");
  const input = document.getElementById("loginServerInput");
  if(!input.value){ try { input.value = (await api().get_server_url()) || ""; } catch(e){} }
  document.getElementById("loginServerMsg").textContent = "";
  box.style.display = "";
}
async function saveServerAddress(){
  const msg = document.getElementById("loginServerMsg");
  const btn = document.getElementById("loginServerSave");
  msg.className = "rl-recover-msg";
  msg.textContent = "Checking the address\u2026";
  btn.disabled = true;
  const result = await api().set_server_url(document.getElementById("loginServerInput").value);
  btn.disabled = false;
  if(result && result.apiError){ msg.className = "rl-recover-msg rl-recover-bad"; msg.textContent = result.apiError; return; }
  msg.className = "rl-recover-msg rl-recover-ok";
  msg.textContent = "Connected. You can sign in now.";
  document.getElementById("loginError").style.display = "none";
  const shown = document.getElementById("loginServerUrl"); if(shown) shown.textContent = result.serverUrl;
  setTimeout(() => { document.getElementById("loginRecover").style.display = "none"; document.getElementById("loginPassword").focus(); }, 900);
}

/* ============================== startup ============================== */
async function completeInit(){
  wireEvents();
  wireShellNav();
  await loadApplications();
  await renderList();
  await clearForm();
  const info = await api().connection_info();
  currentRole = info.role || "technician";
  currentUsername = info.username;
  currentDisplayName = info.displayName || info.username;
  document.body.classList.toggle("is-admin", isAdminOrAbove());
  document.getElementById("dataDirLabel").textContent =
    `Signed in as ${info.displayName || info.username}\n${info.serverUrl}`;

  const initials = (currentDisplayName || "?").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
  const currentRoleLabel = roleLabel(currentRole);
  document.getElementById("topbarAvatar").textContent = initials || "?";
  document.getElementById("topbarName").textContent = currentDisplayName || currentUsername || "—";
  document.getElementById("topbarRole").textContent = currentRoleLabel;
  document.getElementById("accountMenuAvatar").textContent = initials || "?";
  document.getElementById("accountMenuName").textContent = currentDisplayName || currentUsername || "—";
  document.getElementById("accountMenuUsername").textContent = "@" + (currentUsername || "—");
  document.getElementById("accountMenuRole").textContent = currentRoleLabel;

  resetNotifToastState();
  await refreshNotifications();
  if(_notifPollId) clearInterval(_notifPollId);
  _notifPollId = setInterval(refreshNotifications, 30000); // live-feeling badge, Teams/FB-style
  applyDensityPref();
  const startPage = getPref("startPage", "dashboard");
  await showView((isAdminOrAbove() || startPage !== "review-queue") ? startPage : "dashboard");
}

async function init(){
  setIcon("brandIcon", "book");
  setIcon("refInfoIcon", "info");
  setIcon("addStepIcon", "plus");
  setIcon("attachScreenshotIcon", "camera");
  setIcon("attachLogIcon", "fileText");
  setIcon("attachErrorIcon", "fileWarn");
  setIcon("submitIcon", "send");
  setIcon("similarIcon", "search");
  setIcon("searchKbIcon", "search");
  setIcon("editIcon", "edit");
  setIcon("saveIcon", "check");
  document.getElementById("notifBtnIcon").innerHTML = iconSvg("bell");
  document.querySelectorAll(".apps-picker-toggle .chevron").forEach(el => el.innerHTML = iconSvg("chevronDown"));
  document.querySelector(".banner .icon-info").innerHTML = iconSvg("info");
  document.querySelectorAll(".hint-box .icon-info").forEach(el => el.innerHTML = iconSvg("info"));
  document.querySelectorAll("[data-nav-icon]").forEach(el => { el.innerHTML = iconSvg(el.dataset.navIcon); });

  document.getElementById("loginSubmitBtn").addEventListener("click", attemptLogin);
  document.getElementById("loginServerSave").addEventListener("click", saveServerAddress);
  document.getElementById("loginServerInput").addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); saveServerAddress(); } });
  document.getElementById("loginPassword").addEventListener("keydown", e => {
    if(e.key === "Enter"){ e.preventDefault(); attemptLogin(); }
  });

  const info = await api().connection_info();
  document.getElementById("loginServerUrl").textContent = info.serverUrl;
  showLoginScreen();
}

window.addEventListener("DOMContentLoaded", () => whenReady(init));
