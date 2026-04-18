import { initProtectedPage } from "./ui.js";
import { getUsers, setUsers } from "./storage.js";

initProtectedPage("users.html");

const tbody = document.getElementById("usersTableBody");
const form = document.getElementById("userForm");
const searchInput = document.getElementById("searchUser");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEdit");
let editingId = null;

function renderUsers(query = "") {
  const users = getUsers();
  const filtered = users.filter((user) =>
    `${user.name} ${user.email} ${user.role} ${user.status}`.toLowerCase().includes(query.toLowerCase())
  );
  tbody.innerHTML = filtered
    .map(
      (user) => `
      <tr>
        <td class="py-3">${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td><span class="status-pill ${user.status === "Active" ? "status-active" : "status-inactive"}">${user.status}</span></td>
        <td class="space-x-2">
          <button data-id="${user.id}" class="edit-btn action-btn action-btn-edit">Edit</button>
          <button data-id="${user.id}" class="delete-btn action-btn action-btn-delete">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");

  bindRowActions();
}

function bindRowActions() {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const users = getUsers().filter((user) => user.id !== button.dataset.id);
      setUsers(users);
      renderUsers(searchInput.value);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const user = getUsers().find((item) => item.id === button.dataset.id);
      if (!user) return;
      editingId = user.id;
      formTitle.textContent = "Edit User";
      cancelEditBtn.classList.remove("hidden");
      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("role").value = user.role;
      document.getElementById("status").value = user.status;
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    id: editingId ?? crypto.randomUUID(),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    role: document.getElementById("role").value,
    status: document.getElementById("status").value
  };

  const users = getUsers();
  const updated = editingId ? users.map((user) => (user.id === editingId ? payload : user)) : [...users, payload];
  setUsers(updated);
  form.reset();
  editingId = null;
  formTitle.textContent = "Add User";
  cancelEditBtn.classList.add("hidden");
  renderUsers(searchInput.value);
});

cancelEditBtn.addEventListener("click", () => {
  form.reset();
  editingId = null;
  formTitle.textContent = "Add User";
  cancelEditBtn.classList.add("hidden");
});

searchInput.addEventListener("input", () => renderUsers(searchInput.value));

renderUsers();
