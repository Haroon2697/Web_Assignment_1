import { initProtectedPage, ICON_DELETE, ICON_EDIT } from "./ui.js";
import { getUsers, setUsers } from "./storage.js";

initProtectedPage("users.html");

const PAGE_SIZE = 5;
let currentPage = 1;
let editingId = null;

const tbody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchUser");
const form = document.getElementById("userForm");
const formTitle = document.getElementById("userModalTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
const userModal = document.getElementById("userModal");
const openAddUserBtn = document.getElementById("openAddUser");
const exportUsersBtn = document.getElementById("exportUsers");
const usersMeta = document.getElementById("usersMeta");
const usersPagination = document.getElementById("usersPagination");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeUser(user) {
  const avatar =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
  const createdAt = user.createdAt || new Date().toISOString();
  return { ...user, avatar, createdAt };
}

function formatDateDDMMYYYY(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function statusDotClass(status) {
  if (status === "Active") return "status-dot--active";
  if (status === "Suspended") return "status-dot--suspended";
  return "status-dot--inactive";
}

function getFilteredUsers(query = "") {
  const q = query.trim().toLowerCase();
  return getUsers()
    .map(normalizeUser)
    .filter((user) =>
      `${user.name} ${user.email} ${user.role} ${user.status}`.toLowerCase().includes(q)
    );
}

function openModal() {
  if (!userModal) return;
  userModal.classList.remove("user-modal-hidden");
  document.getElementById("name").focus();
}

function closeModal() {
  if (!userModal) return;
  userModal.classList.add("user-modal-hidden");
  form.reset();
  editingId = null;
  formTitle.textContent = "Add User";
}

function renderPagination(totalItems) {
  if (totalItems === 0) {
    usersPagination.innerHTML = "";
    return;
  }
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const parts = [];
  parts.push(
    `<button type="button" class="users-page-btn" data-page="prev" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>`
  );

  for (let p = 1; p <= totalPages; p += 1) {
    parts.push(
      `<button type="button" class="users-page-btn ${p === currentPage ? "is-active" : ""}" data-page="${p}">${p}</button>`
    );
  }

  parts.push(
    `<button type="button" class="users-page-btn" data-page="next" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>`
  );

  usersPagination.innerHTML = parts.join("");

  usersPagination.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.page;
      if (target === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (target === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = Number(target);
      renderUsers(searchInput.value);
    });
  });
}

function renderUsers(query = "") {
  const filtered = getFilteredUsers(query);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  usersMeta.innerHTML = `Showing <strong>${pageRows.length}</strong> out of <strong>${total}</strong> entries`;

  tbody.innerHTML = pageRows
    .map((user, i) => {
      const rowNum = start + i + 1;
      const dotClass = statusDotClass(user.status);
      return `
      <tr>
        <td class="tabular-nums text-slate-500 dark:text-slate-400">${rowNum}</td>
        <td>
          <div class="users-cell-name">
            <img class="users-avatar" src="${escapeHtml(user.avatar)}" alt="" width="36" height="36" />
            <span class="font-medium">${escapeHtml(user.name)}</span>
          </div>
        </td>
        <td class="text-slate-600 dark:text-slate-300">${formatDateDDMMYYYY(user.createdAt)}</td>
        <td>${escapeHtml(user.role)}</td>
        <td>
          <span class="inline-flex items-center gap-2">
            <span class="status-dot ${dotClass}" aria-hidden="true"></span>
            <span>${escapeHtml(user.status)}</span>
          </span>
        </td>
        <td>
          <div class="inline-flex items-center gap-1">
            <button type="button" data-id="${user.id}" class="edit-btn icon-btn icon-btn--edit users-action-icon users-action-icon--edit" title="Edit" aria-label="Edit user">${ICON_EDIT}</button>
            <button type="button" data-id="${user.id}" class="delete-btn icon-btn icon-btn--delete users-action-icon users-action-icon--delete" title="Delete" aria-label="Delete user">${ICON_DELETE}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  renderPagination(total);
  bindRowActions();
}

function bindRowActions() {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const users = getUsers().filter((user) => user.id !== button.dataset.id);
      setUsers(users);
      const filtered = getFilteredUsers(searchInput.value);
      const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (currentPage > maxPage) currentPage = maxPage;
      renderUsers(searchInput.value);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const raw = getUsers().find((item) => item.id === button.dataset.id);
      if (!raw) return;
      const user = normalizeUser(raw);
      editingId = user.id;
      formTitle.textContent = "Edit User";
      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("role").value = user.role;
      document.getElementById("status").value = user.status;
      openModal();
    });
  });
}

if (openAddUserBtn) {
  openAddUserBtn.addEventListener("click", () => {
    editingId = null;
    form.reset();
    formTitle.textContent = "Add User";
    openModal();
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", closeModal);
}

if (userModal) {
  userModal.addEventListener("click", (e) => {
    if (e.target === userModal) closeModal();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;

  const users = getUsers();
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

  let payload;
  if (editingId) {
    const existing = users.find((u) => u.id === editingId);
    payload = {
      id: editingId,
      name,
      email,
      role,
      status,
      createdAt: existing?.createdAt || new Date().toISOString(),
      avatar: existing?.avatar || avatar
    };
  } else {
    payload = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      status,
      createdAt: new Date().toISOString(),
      avatar
    };
  }

  const wasEditing = Boolean(editingId);
  const updated = editingId ? users.map((user) => (user.id === editingId ? payload : user)) : [...users, payload];
  setUsers(updated);
  closeModal();
  const filteredAfter = getFilteredUsers(searchInput.value);
  if (!wasEditing) {
    searchInput.value = "";
    currentPage = Math.max(1, Math.ceil(getFilteredUsers("").length / PAGE_SIZE));
    renderUsers("");
    return;
  }
  renderUsers(searchInput.value);
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderUsers(searchInput.value);
});

exportUsersBtn.addEventListener("click", () => {
  const rows = getUsers().map(normalizeUser);
  const header = ["Name", "Email", "Role", "Status", "Date Created (ISO)"];
  const lines = [
    header.join(","),
    ...rows.map((u) =>
      [u.name, u.email, u.role, u.status, u.createdAt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
  ];
  const csv = "\ufeff" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users-export.csv";
  a.click();
  URL.revokeObjectURL(url);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !userModal.classList.contains("user-modal-hidden")) closeModal();
});

renderUsers();
