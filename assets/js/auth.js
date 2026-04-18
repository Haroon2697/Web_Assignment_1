import { seedStorage } from "./storage.js";

const AUTH_KEYS = {
  account: "a1_account",
  loggedIn: "loggedIn",
  currentUser: "currentUser"
};

export function getAccount() {
  const raw = localStorage.getItem(AUTH_KEYS.account);
  return raw ? JSON.parse(raw) : null;
}

export function signup(email, password) {
  const account = { email, password };
  localStorage.setItem(AUTH_KEYS.account, JSON.stringify(account));
  return account;
}

export function login(email, password) {
  const account = getAccount();
  if (!account) {
    return { ok: false, message: "Please sign up first." };
  }
  if (account.email !== email || account.password !== password) {
    return { ok: false, message: "Invalid email or password" };
  }
  localStorage.setItem(AUTH_KEYS.loggedIn, "true");
  localStorage.setItem(AUTH_KEYS.currentUser, JSON.stringify({ email }));
  seedStorage();
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(AUTH_KEYS.loggedIn);
  localStorage.removeItem(AUTH_KEYS.currentUser);
  window.location.href = "login.html";
}

export function requireAuth() {
  const isLoggedIn = localStorage.getItem(AUTH_KEYS.loggedIn);
  const user = localStorage.getItem(AUTH_KEYS.currentUser);
  if (!isLoggedIn || !user) {
    window.location.href = "login.html";
    return null;
  }
  seedStorage();
  return JSON.parse(user);
}

export function redirectIfAuthenticated() {
  const isLoggedIn = localStorage.getItem(AUTH_KEYS.loggedIn);
  if (isLoggedIn) {
    window.location.href = "dashboard.html";
  }
}
