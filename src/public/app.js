console.log("app.js loaded");

const jobsContainer = document.getElementById("jobs");
const statusText = document.getElementById("status");
const queryInput = document.getElementById("query");
const searchBtn = document.getElementById("search-btn");
const toggleBtn = document.getElementById("toggle-btn");

const BASE_URL = "http://localhost:4000/scrape";

let allJobs = [];
let showOnlyUnviewed = false;
let viewedJobIds = new Set();

// Läs in tidigare sparade "sökta" jobb från localStorage
if (localStorage.getItem("viewedJobs")) {
  viewedJobIds = new Set(JSON.parse(localStorage.getItem("viewedJobs")));
}

// Toggle: visa sökta / ej sökta
toggleBtn.addEventListener("click", () => {
  showOnlyUnviewed = !showOnlyUnviewed;

  if (showOnlyUnviewed) {
    toggleBtn.textContent = "Visa alla";
    toggleBtn.classList.remove("off");
  } else {
    toggleBtn.textContent = "Visa sökta";
    toggleBtn.classList.add("off");
  }

  renderJobs();
});

// Klick på "Sök jobb"
searchBtn.addEventListener("click", async () => {
  const query = queryInput.value.trim();

  statusText.textContent = "Hämtar jobb...";
  jobsContainer.innerHTML = "";

  try {
    const url = query ? `${BASE_URL}?q=${encodeURIComponent(query)}` : BASE_URL;
    const response = await fetch(url);
    allJobs = await response.json();

    statusText.textContent = `Hittade ${allJobs.length} jobb`;
    renderJobs();
  } catch (error) {
    console.error("Fel vid hämtning:", error);
    statusText.textContent = "Ett fel uppstod när jobben skulle hämtas.";
  }
});

function renderJobs() {
  jobsContainer.innerHTML = "";

  const jobsToShow = showOnlyUnviewed
    ? allJobs.filter(job => !viewedJobIds.has(job.id))
    : allJobs;

  if (jobsToShow.length === 0) {
    jobsContainer.innerHTML = "<p>Inga jobb att visa.</p>";
    return;
  }

  jobsToShow.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    const viewed = viewedJobIds.has(job.id);

    card.innerHTML = `
      <h2>${job.title}</h2>
      <p><strong>Företag:</strong> ${job.company}</p>
      <p><strong>Stad:</strong> ${job.city}</p>
      <p><strong>Publicerad:</strong> ${job.published?.slice(0, 10) || "-"}</p>
      <p><strong>Sista ansökan:</strong> ${job.lastApply?.slice(0, 10) || "-"}</p>

      <a href="${job.link}" class="job-link" target="_blank">Visa annons</a>

      <p style="margin-top:0.5rem;">
        Status: 
        <span style="color:${viewed ? "green" : "red"};">
          ${viewed ? "✔ Redan sökt" : "✘ Ej sökt än"}
        </span>
      </p>

      <button class="mark-btn">
        ${viewed ? "Markera som EJ sökt" : "Markera som sökt"}
      </button>
    `;

    // När man klickar på knappen: toggla "sökt"
    const markBtn = card.querySelector(".mark-btn");
    markBtn.addEventListener("click", () => {
      if (viewedJobIds.has(job.id)) {
        viewedJobIds.delete(job.id);
      } else {
        viewedJobIds.add(job.id);
      }
      localStorage.setItem("viewedJobs", JSON.stringify([...viewedJobIds]));
      renderJobs();
    });

    // (valfritt) om du fortfarande vill markera som sökt när man öppnar annonsen:
    const link = card.querySelector(".job-link");
    link.addEventListener("click", () => {
      viewedJobIds.add(job.id);
      localStorage.setItem("viewedJobs", JSON.stringify([...viewedJobIds]));
      renderJobs();
    });

    jobsContainer.appendChild(card);
  });
}
