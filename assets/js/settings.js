import { initProtectedPage, initThemeToggle } from "./ui.js";
import { getSettings, setSettings } from "./storage.js";

initProtectedPage("settings.html");
initThemeToggle();

const form = document.getElementById("settingsForm");
const message = document.getElementById("settingsMessage");
const settings = getSettings();

document.getElementById("profileName").value = settings.name || "";
document.getElementById("profileEmail").value = settings.email || "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const updated = {
    ...getSettings(),
    name: document.getElementById("profileName").value.trim(),
    email: document.getElementById("profileEmail").value.trim()
  };
  setSettings(updated);
  message.textContent = "Settings saved successfully.";
});

document.getElementById("passwordForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmNewPassword").value.trim();
  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    message.textContent = "Password fields are required and must match.";
    return;
  }
  message.textContent = "Password updated (mock).";
  event.target.reset();
});
