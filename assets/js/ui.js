import { logout, requireAuth } from "./auth.js";
import { getSettings, setSettings } from "./storage.js";

export function initProtectedPage(activePath) {
  const user = requireAuth();
  if (!user) return null;

  document.querySelectorAll(".sidebar-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === activePath) {
      link.classList.add("active");
    }
  });

  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    userEmailEl.textContent = user.email;
  }

  const logoutButtons = document.querySelectorAll("[data-action='logout']");
  logoutButtons.forEach((button) => button.addEventListener("click", logout));

  const dropdownBtn = document.getElementById("profileButton");
  const dropdown = document.getElementById("profileMenu");
  if (dropdownBtn && dropdown) {
    dropdownBtn.addEventListener("click", () => {
      dropdown.classList.toggle("hidden");
    });
    window.addEventListener("click", (event) => {
      if (!dropdownBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  applyTheme();
  return user;
}

export function applyTheme() {
  const settings = getSettings();
  const root = document.documentElement;
  if (settings.theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function initThemeToggle(toggleId = "themeToggle") {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;
  const settings = getSettings();
  toggle.checked = settings.theme === "dark";
  toggle.addEventListener("change", () => {
    const updated = { ...getSettings(), theme: toggle.checked ? "dark" : "light" };
    setSettings(updated);
    applyTheme();
  });
}
