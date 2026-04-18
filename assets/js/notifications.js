import { initProtectedPage } from "./ui.js";
import { getNotifications, setNotifications } from "./storage.js";

initProtectedPage("notifications.html");

const list = document.getElementById("notificationList");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Supports legacy rows that only had `text` + `time`. */
function normalizeNotification(item) {
  if (item && typeof item.name === "string" && item.action !== undefined) {
    return {
      ...item,
      snippet: item.snippet ?? "",
      avatar:
        item.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0d9488&color=fff`
    };
  }
  const legacy = item?.text ?? "Notification";
  return {
    id: item.id,
    read: !!item.read,
    time: item.time ?? "",
    name: "System",
    action: legacy,
    snippet: "",
    avatar: "https://ui-avatars.com/api/?name=System&background=0d9488&color=fff"
  };
}

function renderNotifications() {
  const items = getNotifications().map(normalizeNotification);
  list.innerHTML = items
    .map(
      (item) => `
      <li class="notification-row ${item.read ? "opacity-75" : ""}">
        <img class="notification-avatar" src="${escapeHtml(item.avatar)}" alt="" width="44" height="44" />
        <div class="min-w-0">
          <p class="font-semibold text-gray-900 dark:text-slate-100 leading-tight">${escapeHtml(item.name)}</p>
          <p class="text-sm text-gray-600 dark:text-slate-300 mt-0.5">${escapeHtml(item.action)}</p>
          ${
            item.snippet
              ? `<p class="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">${escapeHtml(item.snippet)}</p>`
              : ""
          }
          <div class="flex flex-wrap gap-2 mt-2 md:hidden">
            <button type="button" data-id="${item.id}" class="mark-btn action-btn action-btn-mark text-xs">Mark read</button>
            <button type="button" data-id="${item.id}" class="delete-btn action-btn action-btn-delete text-xs">Delete</button>
          </div>
        </div>
        <div class="text-right shrink-0 max-w-[7rem]">
          <p class="notification-meta">${escapeHtml(item.time)}</p>
          <div class="hidden md:flex flex-col gap-1.5 mt-2 items-end">
            <button type="button" data-id="${item.id}" class="mark-btn action-btn action-btn-mark text-xs whitespace-nowrap">Mark read</button>
            <button type="button" data-id="${item.id}" class="delete-btn action-btn action-btn-delete text-xs whitespace-nowrap">Delete</button>
          </div>
        </div>
      </li>`
    )
    .join("");

  document.querySelectorAll(".mark-btn").forEach((button) =>
    button.addEventListener("click", () => {
      const updated = getNotifications().map((item) => {
        if (item.id !== button.dataset.id) return item;
        return { ...normalizeNotification(item), read: true };
      });
      setNotifications(updated);
      renderNotifications();
    })
  );

  document.querySelectorAll(".delete-btn").forEach((button) =>
    button.addEventListener("click", () => {
      const updated = getNotifications().filter((item) => item.id !== button.dataset.id);
      setNotifications(updated);
      renderNotifications();
    })
  );
}

renderNotifications();
