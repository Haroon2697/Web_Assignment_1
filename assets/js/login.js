import { redirectIfAuthenticated, login } from "./auth.js";
import { applyTheme } from "./ui.js";

redirectIfAuthenticated();
applyTheme();

const form = document.getElementById("loginForm");
const error = document.getElementById("errorMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  error.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    error.textContent = "Email and password are required.";
    return;
  }

  const result = login(email, password);
  if (!result.ok) {
    error.textContent = result.message;
    return;
  }

  window.location.href = "dashboard.html";
});
