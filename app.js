const tabs = ["PROFILE", "DECORATIONS"];
let imageMap = {badges:{}, ribbons:{}, foreign:{}};
let active = "PROFILE";

fetch("image-map.json").then(r => r.json()).then(m => { imageMap = m; render(); }).catch(() => render());

document.getElementById("tabs").addEventListener("click", e => {
  const button = e.target.closest("button[data-tab]");
  if (!button) return;
  active = button.dataset.tab;
  render();
  window.scrollTo({top:0, behavior:"smooth"});
});

function esc(v="") { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function imgFor(a) {
  if (a.image) return a.image;
  const key = (a.imageKey || a.name || "").toLowerCase();
  return imageMap[a.category]?.[key] || imageMap.badges?.[key] || imageMap.ribbons?.[key] || imageMap.foreign?.[key] || "";
}
function calculateTimeOfService(joinDate) {
  if (!joinDate) return "";
  // Service-record dates use DD/MM/YY (e.g. 03/06/26 = 3 June 2026).
  const match = String(joinDate).trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;
  const start = new Date(year, month - 1, day);
  if (Number.isNaN(start.getTime())) return "";
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const days = Math.floor((todayUTC - startUTC) / 86400000);
  if (days < 0) return "";
  return `${days} day${days === 1 ? "" : "s"}`;
}

function field(label, value) {
  return `<div class="field"><div class="label">${esc(label)}</div><div class="value">${esc(value || "—")}</div></div>`;
}
function awardCard(a) {
  const src = imgFor(a);
  return `<article class="award-card">
    <div class="award-image">${src ? `<img src="${esc(src)}" alt="${esc(a.name)}" loading="lazy">` : `<div class="image-placeholder">AWARD</div>`}</div>
    <div class="award-copy"><div class="award-name">${esc(a.name)}</div>${a.suffix ? `<div class="award-suffix">${esc(a.suffix)}</div>` : ""}</div>
  </article>`;
}
function section(title, awards) {
  const groups = {};
  awards.forEach(a => (groups[a.group || "Group 1"] ||= []).push(a));
  return `<section class="record-panel"><div class="panel-title">${esc(title)}</div><div class="panel-body">
    ${Object.keys(groups).map(g => `<div class="award-group"><h2>${esc(g)}</h2><div class="gold-rule"></div><div class="award-list">${groups[g].map(awardCard).join("")}</div></div>`).join("") || `<div class="empty">No records have been added yet.</div>`}
  </div></section>`;
}
function profile() {
  const r = RECORD;
  return `<section class="record-panel profile-panel"><div class="panel-title">PROFILE</div><div class="panel-body profile-body">
    <div class="profile-photo-wrap"><img class="profile-photo" src="${esc(r.profileImage)}" alt="Profile photo"></div>
    <div class="profile-grid">
      ${field("USERNAME", r.username)}${field("ROBLOX ID", r.robloxId)}
      ${field("DISCORD ID", r.discordId)}${field("RANK", r.rank)}
      ${field("COMMAND", r.command)}${field("DIVISION", r.division)}
      ${field("BRIGADE/BATTALION/GROUP", r.brigade)}${field("COMPANY", r.company)}
      ${field("JOIN DATE", r.joinDate)}${field("UNIT TIME OF SERVICE", r.timeOfService || calculateTimeOfService(r.joinDate))}
      ${field("POSITION", r.position)}${field("POSITION DATE OF HIRE", r.positionDate)}
    </div>
    <div class="generated">Public service record for WarriorA350.</div>
  </div></section>`;
}
function operations(key) {
  const rows = RECORD.operations?.[key] || [];
  return `<section class="record-panel"><div class="panel-title">${esc(key)}</div><div class="panel-body">
    ${rows.length ? rows.map(row => `<div class="operation"><div class="operation-title">${esc(row.title || row.name || "Record")}</div><div class="operation-detail">${esc(row.detail || "")}</div></div>`).join("") : `<div class="empty">No ${esc(key)} records have been added yet.</div>`}
  </div></section>`;
}
function decorations() {
  return section("DECORATIONS", RECORD.awards);
}
function render() {
  document.getElementById("pageTitle").textContent = `${RECORD.username || "YOURUSERNAME"} | SERVICE RECORD FILE`;
  document.getElementById("subtitle").textContent = `PUBLIC SERVICE RECORD`;
  document.getElementById("tabs").innerHTML = tabs.map(t => `<button data-tab="${t}" class="tab ${active===t?'active':''}">${t}</button>`).join("");
  document.getElementById("app").innerHTML = active === "PROFILE" ? profile() : active === "DECORATIONS" ? decorations() : operations(active);
}
render();
