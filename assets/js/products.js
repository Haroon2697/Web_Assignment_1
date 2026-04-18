import { initProtectedPage } from "./ui.js";
import { getProducts, setProducts } from "./storage.js";

initProtectedPage("products.html");

const tbody = document.getElementById("productsTableBody");
const form = document.getElementById("productForm");
const searchInput = document.getElementById("searchProduct");
const sortSelect = document.getElementById("sortProduct");
const formTitle = document.getElementById("productFormTitle");
const cancelEditBtn = document.getElementById("cancelProductEdit");
let editingId = null;

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const sort = sortSelect.value;
  const products = getProducts().filter((product) =>
    `${product.name} ${product.status} ${product.price} ${product.quantity}`.toLowerCase().includes(query)
  );

  if (sort === "price-asc") products.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  if (sort === "qty-asc") products.sort((a, b) => a.quantity - b.quantity);
  if (sort === "qty-desc") products.sort((a, b) => b.quantity - a.quantity);

  return products;
}

function renderProducts() {
  const products = getFilteredProducts();
  tbody.innerHTML = products
    .map(
      (product) => `
      <tr>
        <td class="py-3">${product.name}</td>
        <td>$${Number(product.price).toLocaleString()}</td>
        <td><span class="status-pill ${product.status === "Active" ? "status-active" : "status-inactive"}">${product.status}</span></td>
        <td><img src="${product.picture}" alt="${product.name}" class="w-10 h-10 rounded-md object-cover"></td>
        <td>${product.quantity}</td>
        <td class="space-x-2">
          <button data-id="${product.id}" class="product-edit action-btn action-btn-edit">Edit</button>
          <button data-id="${product.id}" class="product-delete action-btn action-btn-delete">Delete</button>
        </td>
      </tr>`
    )
    .join("");

  document.querySelectorAll(".product-delete").forEach((button) => {
    button.addEventListener("click", () => {
      setProducts(getProducts().filter((item) => item.id !== button.dataset.id));
      renderProducts();
    });
  });

  document.querySelectorAll(".product-edit").forEach((button) => {
    button.addEventListener("click", () => {
      const item = getProducts().find((product) => product.id === button.dataset.id);
      if (!item) return;
      editingId = item.id;
      formTitle.textContent = "Edit Product";
      cancelEditBtn.classList.remove("hidden");
      document.getElementById("productName").value = item.name;
      document.getElementById("productPrice").value = item.price;
      document.getElementById("productStatus").value = item.status;
      document.getElementById("productPicture").value = item.picture;
      document.getElementById("productQuantity").value = item.quantity;
    });
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    id: editingId ?? crypto.randomUUID(),
    name: document.getElementById("productName").value.trim(),
    price: Number(document.getElementById("productPrice").value),
    status: document.getElementById("productStatus").value,
    picture: document.getElementById("productPicture").value.trim() || "https://picsum.photos/100",
    quantity: Number(document.getElementById("productQuantity").value)
  };
  const products = getProducts();
  const updated = editingId
    ? products.map((product) => (product.id === editingId ? payload : product))
    : [...products, payload];
  setProducts(updated);
  editingId = null;
  form.reset();
  formTitle.textContent = "Add Product";
  cancelEditBtn.classList.add("hidden");
  renderProducts();
});

cancelEditBtn.addEventListener("click", () => {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add Product";
  cancelEditBtn.classList.add("hidden");
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

renderProducts();
