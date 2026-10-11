
import { useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";

import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Careers from "./pages/Careers.jsx";
import Skills from "./pages/Skills.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Curriculum from "./pages/Curriculum.jsx";
import MyAssignments from "./pages/MyAssignments.jsx";

const TABS = [
  ["dashboard", "Dashboard"],
  ["profile", "Profile"],
  ["skills", "My Skills"],
  ["careers", "Careers"],
  ["roadmap", "Roadmap"],
  ["curriculum", "Curriculum"],
  ["assignments", "My Assignments"],
];

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) return;

    api("/auth/me")
      .then((data) => {
        setUser(data);
        setTab("dashboard");
      })
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  function navigate(page) {
    setTab(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setTab("dashboard");
    setMenuOpen(false);
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setTab("dashboard");
    setMenuOpen(false);
  }

  if (!ready) {
    return (
      <div className="cc-loading" role="status">
        <div className="cc-loading-spinner" />
        <p>Loading CareerCompass...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuth={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="bar cc-navbar">
        <button
          type="button"
          className="cc-brand"
          onClick={() => navigate("dashboard")}
          aria-label="CareerCompass dashboard"
        >
          <span className="cc-brand-icon">✦</span>
          <span>CareerCompass</span>
        </button>

        <button
          type="button"
          className="cc-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={
            menuOpen ? "Close navigation" : "Open navigation"
          }
          aria-expanded={menuOpen}
          aria-controls="cc-main-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="cc-main-navigation"
          className={
            menuOpen ? "cc-nav cc-nav-open" : "cc-nav"
          }
          aria-label="Main navigation"
        >
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                tab === id
                  ? "cc-nav-link cc-nav-active"
                  : "cc-nav-link"
              }
              aria-current={
                tab === id ? "page" : undefined
              }
              onClick={() => navigate(id)}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            className="cc-signout"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </nav>
      </header>

      <main className="cc-main">
        {tab === "dashboard" && (
          <Dashboard user={user} navigate={navigate} />
        )}

        {tab === "profile" && (
          <Profile user={user} onSaved={setUser} />
        )}

        {tab === "skills" && <Skills />}

        {tab === "careers" && (
          <Careers onChosen={() => navigate("roadmap")} />
        )}

        {tab === "roadmap" && (
          <Roadmap
            goToCareers={() => navigate("careers")}
          />
        )}
        {tab === "curriculum" && <Curriculum />}
        {tab === "assignments" && <MyAssignments />}
      </main>

      <footer className="cc-footer">
        <p>
          © {new Date().getFullYear()} CareerCompass.
          Your journey, your direction.
        </p>
      </footer>
    </div>
  );
}
