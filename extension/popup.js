
const API_URL = "http://localhost:4000";
const WEBSITE_URL = "http://localhost:5173";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");
const userGreeting = document.getElementById("userGreeting");

function showLogin() {
  loginSection.hidden = false;
  dashboardSection.hidden = true;
}


function showDashboard(name) {
  loginSection.hidden = true;
  dashboardSection.hidden = false;

  userGreeting.textContent = name
    ? `Welcome, ${name}!`
    : "My Dashboard";

  loadAssignments();
   loadRoadmap();
   loadSkills();
}

async function loadAssignments() {
  const summary = document.getElementById("assignmentSummary");

  if (!summary) {
    console.error("assignmentSummary element not found");
    return;
  }

  summary.textContent = "Loading assignments...";

  try {
    const { token } = await chrome.storage.local.get("token");

    if (!token) {
      summary.textContent = "Please sign in.";
      return;
    }

    const response = await fetch(
      `${API_URL}/api/assignments/my`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();

    // Accept an array or an object containing assignments.
    const assignments = Array.isArray(data)
      ? data
      : data.assignments;

    if (!Array.isArray(assignments)) {
      throw new Error("Unexpected assignments response");
    }

    const total = assignments.length;

    const inProgress = assignments.filter(
      (a) => a.status === "in_progress"
    ).length;

    const submitted = assignments.filter(
      (a) => a.status === "submitted"
    ).length;

    summary.textContent =
      `Total: ${total} | In Progress: ${inProgress} | Submitted: ${submitted}`;

  } catch (error) {
    console.error("Assignments error:", error);
    summary.textContent = "Unable to load assignments.";
  }
}

async function loadRoadmap() {
  const careerElement = document.getElementById("roadmapCareer");
  const detailsElement = document.getElementById("roadmapDetails");
  const weekElement = document.getElementById("roadmapWeek");
  const progressBar = document.getElementById("roadmapProgressBar");
  const progressText = document.getElementById("roadmapProgressText");
  const milestonesElement = document.getElementById("roadmapMilestones");

  if (!careerElement || !detailsElement) {
    console.error("Roadmap HTML elements not found");
    return;
  }

  careerElement.textContent = "Loading your career roadmap...";
  detailsElement.hidden = true;

  try {
    const { token } = await chrome.storage.local.get("token");

    if (!token) {
      careerElement.textContent = "Please sign in.";
      return;
    }

    const response = await fetch(
      `${API_URL}/api/roadmaps/current`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Roadmap request failed: ${response.status}`);
    }

    const roadmap = await response.json();

    if (!roadmap) {
      careerElement.textContent =
        "No active roadmap. Create one on the CareerCompass website.";
      return;
    }

    careerElement.textContent =
      roadmap.careerTitle || "My Career Roadmap";

    const week = Math.max(1, Number(roadmap.currentWeek) || 1);
    weekElement.textContent = `Current Week: ${week}`;

    const percent = Math.min(
      100,
      Math.max(0, Number(roadmap.progress?.percent) || 0)
    );

    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}% completed`;

    const milestones = Array.isArray(roadmap.milestones)
      ? roadmap.milestones
      : [];

    milestonesElement.textContent =
      `${milestones.length} learning milestones`;

    detailsElement.hidden = false;

  } catch (error) {
    console.error("Roadmap loading error:", error);
    careerElement.textContent = "Unable to load roadmap.";
  }
}

async function loadSkills() {
  const summary = document.getElementById("skillsSummary");
  const list = document.getElementById("skillsList");

  if (!summary || !list) {
    console.error("Skills HTML elements not found");
    return;
  }

  summary.textContent = "Loading your skills...";
  list.replaceChildren();

  try {
    const { token } = await chrome.storage.local.get("token");

    if (!token) {
      summary.textContent = "Please sign in.";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    const [allResponse, mineResponse] = await Promise.all([
      fetch(`${API_URL}/api/skills`, { headers }),
      fetch(`${API_URL}/api/skills/mine`, { headers })
    ]);

    if (!allResponse.ok || !mineResponse.ok) {
      throw new Error("Unable to fetch skills");
    }

    const allSkills = await allResponse.json();
    const mySkills = await mineResponse.json();

    if (!Array.isArray(allSkills) || !Array.isArray(mySkills)) {
      throw new Error("Unexpected skills response");
    }

    if (mySkills.length === 0) {
      summary.textContent = "No skills assessed yet.";
      return;
    }

    const skillNames = new Map(
      allSkills.map(skill => [String(skill.id), skill.name])
    );

    summary.textContent = `${mySkills.length} skills recorded`;

    mySkills.forEach(skill => {
      const name = skillNames.get(String(skill.skillId)) || "Unknown skill";
      const level = Math.min(
        5,
        Math.max(0, Number(skill.level) || 0)
      );

      const item = document.createElement("div");
      item.className = "skill-item";

      const heading = document.createElement("div");
      heading.className = "skill-heading";

      const nameElement = document.createElement("span");
      nameElement.textContent = name;

      const levelElement = document.createElement("span");
      levelElement.textContent = `Level ${level}/5`;

      heading.append(nameElement, levelElement);

      const track = document.createElement("div");
      track.className = "skill-track";

      const bar = document.createElement("div");
      bar.className = "skill-bar";
      bar.style.width = `${level * 20}%`;

      track.appendChild(bar);
      item.append(heading, track);
      list.appendChild(item);
    });

  } catch (error) {
    console.error("Skills loading error:", error);
    summary.textContent = "Unable to load skills.";
  }
}


async function initialize() {
  const { token, userName } = await chrome.storage.local.get([
    "token",
    "userName"
  ]);

  if (token) {
    showDashboard(userName);
  } else {
    showLogin();
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // We will verify these fields against your existing
    // backend response before testing login.
    const token = data.token;
    const userName = data.user?.name || "";

    if (!token) {
      throw new Error("Login response did not contain a token");
    }

    await chrome.storage.local.set({
      token,
      userName
    });

    showDashboard(userName);
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

document.getElementById("logoutButton").addEventListener(
  "click",
  async () => {
    await chrome.storage.local.remove(["token", "userName"]);
    loginForm.reset();
    showLogin();
  }
);

document.getElementById("openWebsite").addEventListener(
  "click",
  () => {
    chrome.tabs.create({ url: WEBSITE_URL });
  }
);

initialize();
