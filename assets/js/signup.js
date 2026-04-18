import { redirectIfAuthenticated, signup } from "./auth.js";
import { applyTheme } from "./ui.js";

redirectIfAuthenticated();
applyTheme();

const form = document.getElementById("signupForm");
const message = document.getElementById("formMessage");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  message.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!email || !password || !confirmPassword) {
    message.textContent = "All fields are required.";
    message.className = "text-sm text-red-500";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    message.className = "text-sm text-red-500";
    return;
  }

  signup(email, password);
  message.textContent = "Account created. You can login now.";
  message.className = "text-sm text-green-600";
  setTimeout(() => {
    window.location.href = "login.html";
  }, 900);
});
