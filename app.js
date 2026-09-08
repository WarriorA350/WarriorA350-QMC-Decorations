const tabs = ["PROFILE", "DECORATIONS"];

let imageMap = {
  badges: {},
  ribbons: {},
  foreign: {}
};

let active = "PROFILE";

/* Load the image map */
fetch("image-map.json")
  .then(response => {
    if (!response.ok) throw new Error("Could not load image-map.json");
    return response.json();
  })
  .then(map => {
    imageMap = map;
    render();
  })
  .catch(() => {
    render();
  });


/* Tab navigation */
document.getElementById("tabs").addEventListener("click", event => {
  const button = event.target.closest("button[data-tab]");

  if (!button) return;

  active = button.dataset.tab;

  render();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


/* Prevent HTML from breaking the page */
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}


/* Get award image */
function imgFor(award) {

  /* Direct image URL from data.js */
  if (award.image) {
    return award.image;
  }

  /* Image-map fallback */
  const key = (
    award.imageKey ||
    award.name ||
    ""
  ).toLowerCase();

  return (
    imageMap[award.category]?.[key] ||
    imageMap.badges?.[key] ||
    imageMap.ribbons?.[key] ||
    imageMap.foreign?.[key] ||
    ""
  );
}


/* Automatically calculate service time */
function calculateTimeOfService(joinDate) {

  if (!joinDate) return "";

  const match = String(joinDate)
    .trim()
    .match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2}|\d{4})$/);

  if (!match) return "";

  const day = Number(match[1]);
  const month = Number(match[2]);

  let year = Number(match[3]);

  if (year < 100) {
    year += 2000;
  }

  const startDate = new Date(
    year,
    month - 1,
    day
  );

  if (Number.isNaN(startDate.getTime())) {
    return "";
  }

  const today = new Date();

  const todayUTC = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const startUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const days = Math.floor(
    (todayUTC - startUTC) / 86400000
  );

  if (days < 0) return "";

  return `${days} day${days === 1 ? "" : "s"}`;
}


/* Profile field */
function field(label, value) {

  return `
    <div class="field">

      <div class="label">
        ${esc(label)}
      </div>

      <div class="value">
        ${esc(value || "—")}
      </div>

    </div>
  `;
}


/* Individual award */
function awardCard(award) {

  const image = imgFor(award);

  return `
    <article class="award-card">

      <div class="award-image">

        ${
          image
            ? `
              <img
                src="${esc(image)}"
                alt="${esc(award.name)}"
                loading="lazy"
                onerror="
                  this.style.display='none';
                  this.parentElement.innerHTML='<div class=&quot;image-placeholder&quot;>IMAGE ERROR</div>';
                "
              >
            `
            : `
              <div class="image-placeholder">
                AWARD
              </div>
            `
        }

      </div>

      <div class="award-copy">

        <div class="award-name">
          ${esc(award.name)}
        </div>

        ${
          award.suffix
            ? `
              <div class="award-suffix">
                ${esc(award.suffix)}
              </div>
            `
            : ""
        }

      </div>

    </article>
  `;
}


/* Award sections */
function section(title, awards = []) {

  const groups = {};

  awards.forEach(award => {

    const group = award.group || "Group 1";

    if (!groups[group]) {
      groups[group] = [];
    }

    groups[group].push(award);
  });


  const groupHTML = Object.keys(groups)
    .map(group => {

      return `
        <div class="award-group">

          <h2>
            ${esc(group)}
          </h2>

          <div class="gold-rule"></div>

          <div class="award-list">
            ${groups[group].map(awardCard).join("")}
          </div>

        </div>
      `;

    })
    .join("");


  return `
    <section class="record-panel">

      <div class="panel-title">
        ${esc(title)}
      </div>

      <div class="panel-body">

        ${
          groupHTML ||
          `
            <div class="empty">
              No records have been added yet.
            </div>
          `
        }

      </div>

    </section>
  `;
}


/* Profile page */
function profile() {

  const record = RECORD;

  const serviceTime =
    record.timeOfService ||
    calculateTimeOfService(record.joinDate);

  return `
    <section class="record-panel profile-panel">

      <div class="panel-title">
        PROFILE
      </div>

      <div class="panel-body profile-body">

        <div class="profile-photo-wrap">

          <img
            class="profile-photo"
            src="${esc(record.profileImage)}"
            alt="Profile photo"
          >

        </div>


        <div class="profile-grid">

          ${field("USERNAME", record.username)}

          ${field("ROBLOX ID", record.robloxId)}


          ${field("DISCORD ID", record.discordId)}

          ${field("RANK", record.rank)}


          ${field("COMMAND", record.command)}

          ${field("DIVISION", record.division)}


          ${field(
            "BRIGADE/BATTALION/GROUP",
            record.brigade
          )}

          ${field("COMPANY", record.company)}


          ${field("JOIN DATE", record.joinDate)}

          ${field(
            "UNIT TIME OF SERVICE",
            serviceTime
          )}


          ${field("POSITION", record.position)}

          ${field(
            "POSITION DATE OF HIRE",
            record.positionDate
          )}

        </div>

        </div>

      </div>

    </section>
  `;
}


/* Decorations page */
function decorations() {

  return section(
    "DECORATIONS",
    RECORD.awards || []
  );
}


/* Render the page */
function render() {

  const username =
    RECORD.username || "YOURUSERNAME";


  /* Browser tab title */
  document.title =
    `${username} | Service Record File`;


  /* Header */
  document.getElementById("pageTitle").textContent =
    `${username} | SERVICE RECORD FILE`;


  document.getElementById("subtitle").textContent =
    "PUBLIC SERVICE RECORD";


  /* Navigation */
  document.getElementById("tabs").innerHTML =
    tabs.map(tab => {

      return `
        <button
          data-tab="${tab}"
          class="tab ${active === tab ? "active" : ""}"
        >
          ${tab}
        </button>
      `;

    }).join("");


  /* Main content */
  document.getElementById("app").innerHTML =
    active === "PROFILE"
      ? profile()
      : decorations();
}


/* Initial render */
render();
