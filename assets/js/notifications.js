import { initProtectedPage, ICON_DELETE } from "./ui.js";
import { getNotifications, setNotifications } from "./storage.js";

initProtectedPage("notifications.html");

const list = document.getElementById("notificationList");
const restoreBtn = document.getElementById("restoreNotifications");

function createDefaultNotifications() {
  return [
    {
      id: crypto.randomUUID(),
      name: "Kate Young",
      action: "Commented on your dashboard",
      snippet: "Great work on the analytics layout — really clean charts.",
      avatar: "https://ui-avatars.com/api/?name=Kate+Young&background=0d9488&color=fff",
      read: false,
      time: "5 mins ago"
    },
    {
      id: crypto.randomUUID(),
      name: "Nova Admin",
      action: "New user registered",
      snippet: "A new account was created from the signup page.",
      avatar: "https://ui-avatars.com/api/?name=Nova&background=0891b2&color=fff",
      read: false,
      time: "1 hour ago"
    },
    {
      id: crypto.randomUUID(),
      name: "Orders",
      action: "Order placed successfully",
      snippet: "Order #1042 — Team Plan × 1",
      avatar: "https://ui-avatars.com/api/?name=Orders&background=6366f1&color=fff",
      read: false,
      time: "Yesterday"
    },
    {
      id: crypto.randomUUID(),
      name: "Reports",
      action: "Weekly report generated",
      snippet: "Your summary PDF is ready to download.",
      avatar: "https://ui-avatars.com/api/?name=Reports&background=64748b&color=fff",
      read: true,
      time: "2 days ago"
    }
  ];
}

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
      <li class="notification-row ${item.read ? "is-read" : ""}">
        <img class="notification-avatar" src="${escapeHtml(item.avatar)}" alt="" width="44" height="44" />
        <div class="min-w-0">
          <p class="notification-name">${escapeHtml(item.name)}</p>
          <p class="notification-action">${escapeHtml(item.action)}</p>
          ${
            item.snippet
              ? `<p class="notification-snippet">${escapeHtml(item.snippet)}</p>`
              : ""
          }
          <div class="flex flex-wrap gap-2 mt-2 md:hidden">
            <button type="button" data-id="${item.id}" class="mark-btn action-btn action-btn-mark text-xs">Mark read</button>
            <button type="button" data-id="${item.id}" class="delete-btn icon-btn icon-btn--delete" title="Delete" aria-label="Delete">${ICON_DELETE}</button>
          </div>
        </div>
        <div class="text-right shrink-0 max-w-[8rem]">
          <p class="notification-meta">${escapeHtml(item.time)}</p>
          <div class="hidden md:flex items-center gap-1.5 mt-1.5 justify-end">
            <button type="button" data-id="${item.id}" class="mark-btn action-btn action-btn-mark text-xs whitespace-nowrap">Mark read</button>
            <button type="button" data-id="${item.id}" class="delete-btn icon-btn icon-btn--delete" title="Delete" aria-label="Delete">${ICON_DELETE}</button>
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

if (restoreBtn) {
  restoreBtn.addEventListener("click", () => {
    setNotifications(createDefaultNotifications());
    renderNotifications();
  });
}
