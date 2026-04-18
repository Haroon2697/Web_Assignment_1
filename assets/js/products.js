import { initProtectedPage, ICON_DELETE, ICON_EDIT } from "./ui.js";
import { getProducts, setProducts } from "./storage.js";

initProtectedPage("products.html");

const PAGE_SIZE = 5;
let currentPage = 1;
let editingId = null;

const tbody = document.getElementById("productsTableBody");
const searchInput = document.getElementById("searchProduct");
const sortSelect = document.getElementById("sortProduct");
const form = document.getElementById("productForm");
const formTitle = document.getElementById("productModalTitle");
const cancelEditBtn = document.getElementById("cancelProductEdit");
const productModal = document.getElementById("productModal");
const openAddProductBtn = document.getElementById("openAddProduct");
const exportProductsBtn = document.getElementById("exportProducts");
const productsMeta = document.getElementById("productsMeta");
const productsPagination = document.getElementById("productsPagination");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeProduct(product) {
  const picture =
    product.picture?.trim() || `https://picsum.photos/seed/${encodeURIComponent(product.name)}/100`;
  return { ...product, picture };
}

function productStatusDotClass(status) {
  if (status === "Active") return "status-dot--active";
  return "status-dot--inactive";
}

function getFilteredProducts() {
  const query = (searchInput?.value ?? "").trim().toLowerCase();
  const sort = sortSelect?.value ?? "";
  const products = getProducts()
    .map(normalizeProduct)
    .filter((product) =>
      `${product.name} ${product.status} ${product.price} ${product.quantity}`.toLowerCase().includes(query)
    );

  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (sort === "qty-asc") products.sort((a, b) => a.quantity - b.quantity);
  if (sort === "qty-desc") products.sort((a, b) => b.quantity - a.quantity);

  return products;
}

function openModal() {
  if (!productModal) return;
  productModal.classList.remove("user-modal-hidden");
  document.getElementById("productName")?.focus();
}

function closeModal() {
  if (!productModal) return;
  productModal.classList.add("user-modal-hidden");
  if (form) form.reset();
  editingId = null;
  if (formTitle) formTitle.textContent = "Add Product";
}

function renderPagination(totalItems) {
  if (!productsPagination) return;
  if (totalItems === 0) {
    productsPagination.innerHTML = "";
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
  productsPagination.innerHTML = parts.join("");

  productsPagination.querySelectorAll("button[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.page;
      if (target === "prev") currentPage = Math.max(1, currentPage - 1);
      else if (target === "next") currentPage = Math.min(totalPages, currentPage + 1);
      else currentPage = Number(target);
      renderProducts();
    });
  });
}

function renderProducts() {
  if (!tbody || !productsMeta) return;
  const filtered = getFilteredProducts();
  const total = filtered.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  productsMeta.innerHTML = `Showing <strong>${pageRows.length}</strong> out of <strong>${total}</strong> entries`;

  tbody.innerHTML = pageRows
    .map((product, i) => {
      const rowNum = start + i + 1;
      const dotClass = productStatusDotClass(product.status);
      return `
      <tr>
        <td class="tabular-nums text-slate-500 dark:text-slate-400">${rowNum}</td>
        <td>
          <div class="users-cell-name">
            <img class="users-avatar" src="${escapeHtml(product.picture)}" alt="" width="36" height="36" />
            <span class="font-medium">${escapeHtml(product.name)}</span>
          </div>
        </td>
        <td class="tabular-nums font-medium">$${Number(product.price).toLocaleString()}</td>
        <td>
          <span class="inline-flex items-center gap-2">
            <span class="status-dot ${dotClass}" aria-hidden="true"></span>
            <span>${escapeHtml(product.status)}</span>
          </span>
        </td>
        <td class="tabular-nums">${product.quantity}</td>
        <td>
          <div class="inline-flex items-center gap-1">
            <button type="button" data-id="${product.id}" class="product-edit icon-btn icon-btn--edit users-action-icon users-action-icon--edit" title="Edit" aria-label="Edit product">${ICON_EDIT}</button>
            <button type="button" data-id="${product.id}" class="product-delete icon-btn icon-btn--delete users-action-icon users-action-icon--delete" title="Delete" aria-label="Delete product">${ICON_DELETE}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  renderPagination(total);

  document.querySelectorAll(".product-delete").forEach((button) => {
    button.addEventListener("click", () => {
      setProducts(getProducts().filter((item) => item.id !== button.dataset.id));
      const filteredAfter = getFilteredProducts();
      const maxPage = Math.max(1, Math.ceil(filteredAfter.length / PAGE_SIZE));
      if (currentPage > maxPage) currentPage = maxPage;
      renderProducts();
    });
  });

  document.querySelectorAll(".product-edit").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getProducts().find((product) => product.id === button.dataset.id);
      if (!item) return;
      const p = normalizeProduct(item);
      editingId = p.id;
      if (formTitle) formTitle.textContent = "Edit Product";
      document.getElementById("productName").value = p.name;
      document.getElementById("productPrice").value = p.price;
      document.getElementById("productStatus").value = p.status;
      document.getElementById("productPicture").value = item.picture || "";
      document.getElementById("productQuantity").value = p.quantity;
      openModal();
    });
  });
}

if (openAddProductBtn) {
  openAddProductBtn.addEventListener("click", () => {
    editingId = null;
    if (form) form.reset();
    if (formTitle) formTitle.textContent = "Add Product";
    openModal();
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", closeModal);
}

if (productModal) {
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });
}

const productModalPanel = document.querySelector("#productModal .user-modal-panel");
if (productModalPanel) {
  productModalPanel.addEventListener("click", (e) => e.stopPropagation());
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);
    const status = document.getElementById("productStatus").value;
    const quantity = Number(document.getElementById("productQuantity").value);

    const products = getProducts();
    const wasEditing = Boolean(editingId);
    const picInput = document.getElementById("productPicture").value.trim();

    let payload;
    if (editingId) {
      const existing = products.find((p) => p.id === editingId);
      payload = {
        id: editingId,
        name,
        price,
        status,
        picture: picInput || existing?.picture || "https://picsum.photos/100",
        quantity
      };
    } else {
      payload = {
        id: crypto.randomUUID(),
        name,
        price,
        status,
        picture: picInput || "https://picsum.photos/100",
        quantity
      };
    }

    const updated = editingId ? products.map((p) => (p.id === editingId ? payload : p)) : [...products, payload];
    setProducts(updated);
    closeModal();
    if (!wasEditing) {
      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "";
      currentPage = Math.max(1, Math.ceil(getFilteredProducts().length / PAGE_SIZE));
      renderProducts();
      return;
    }
    renderProducts();
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderProducts();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    currentPage = 1;
    renderProducts();
  });
}

if (exportProductsBtn) {
  exportProductsBtn.addEventListener("click", () => {
    const rows = getProducts().map(normalizeProduct);
    const header = ["Name", "Price", "Status", "Picture URL", "Quantity"];
    const lines = [
      header.join(","),
      ...rows.map((p) =>
        [p.name, p.price, p.status, p.picture, p.quantity]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
    ];
    const csv = "\ufeff" + lines.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && productModal && !productModal.classList.contains("user-modal-hidden")) {
    closeModal();
  }
});

if (tbody && productsMeta) {
  renderProducts();
}
