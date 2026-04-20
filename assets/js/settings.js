import { initProtectedPage, initThemeToggle } from "./ui.js";
import { getSettings, setSettings } from "./storage.js";
import { updatePassword, updateAccountEmail } from "./auth.js";

initProtectedPage("settings.html");
initThemeToggle();

const form = document.getElementById("settingsForm");
const message = document.getElementById("settingsMessage");
const settings = getSettings();

document.getElementById("profileName").value = settings.name || "";
document.getElementById("profileEmail").value = settings.email || "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  const prev = getSettings();
  const updated = { ...prev, name, email };
  setSettings(updated);
  if (email && email !== prev.email) {
    updateAccountEmail(email);
  }
  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) userEmailEl.textContent = email;
  message.textContent = "Settings saved successfully.";
});

document.getElementById("passwordForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmNewPassword").value.trim();
  if (!currentPassword) {
    message.textContent = "Enter your current password.";
    return;
  }
  if (!newPassword || newPassword !== confirmPassword) {
    message.textContent = "New password and confirmation must match.";
    return;
  }
  const result = updatePassword(currentPassword, newPassword);
  if (!result.ok) {
    message.textContent = result.message;
    return;
  }
  message.textContent = "Password saved. Use the new password next time you log in.";
  event.target.reset();
});
