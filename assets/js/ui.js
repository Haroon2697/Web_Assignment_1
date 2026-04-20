import { logout, requireAuth } from "./auth.js";
import { getSettings, setSettings } from "./storage.js";

/** Pen + trash icons (shared table actions; avoids extra module fetch failures) */
export const ICON_EDIT = `<svg class="icon-btn-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>`;

export const ICON_DELETE = `<svg class="icon-btn-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;

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
  initMobileSidebar();
  return user;
}

/** Hamburger drawer: sidebar fixed off-canvas below md breakpoint; static sidebar on md+. */
export function initMobileSidebar() {
  const sidebar = document.getElementById("appSidebar");
  const toggle = document.getElementById("sidebarToggle");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (!sidebar || !toggle) return;

  const mq = window.matchMedia("(max-width: 1023px)");

  function close() {
    sidebar.classList.remove("is-open");
    backdrop?.classList.add("hidden");
    backdrop?.classList.remove("sidebar-backdrop--visible");
    document.body.classList.remove("sidebar-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function open() {
    if (!mq.matches) return;
    sidebar.classList.add("is-open");
    backdrop?.classList.remove("hidden");
    backdrop?.classList.add("sidebar-backdrop--visible");
    document.body.classList.add("sidebar-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) close();
    else open();
  });

  backdrop?.addEventListener("click", close);

  sidebar.querySelectorAll(".sidebar-close-btn").forEach((btn) => {
    btn.addEventListener("click", close);
  });

  sidebar.querySelectorAll("a.sidebar-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (mq.matches) close();
    });
  });

  mq.addEventListener("change", (e) => {
    if (!e.matches) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) close();
  });
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
