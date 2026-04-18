const KEYS = {
  users: "a1_users",
  products: "a1_products",
  notifications: "a1_notifications",
  settings: "a1_settings"
};

const DEFAULTS = {
  users: [
    { id: crypto.randomUUID(), name: "Admin User", email: "admin@demo.com", role: "Admin", status: "Active" },
    { id: crypto.randomUUID(), name: "Sara Khan", email: "sara@demo.com", role: "Manager", status: "Active" },
    { id: crypto.randomUUID(), name: "Ali Ahmed", email: "ali@demo.com", role: "Support", status: "Inactive" }
  ],
  products: [
    { id: crypto.randomUUID(), name: "Pro Plan", price: 99, status: "Active", picture: "https://picsum.photos/100?1", quantity: 74 },
    { id: crypto.randomUUID(), name: "Team Plan", price: 199, status: "Active", picture: "https://picsum.photos/100?2", quantity: 40 },
    { id: crypto.randomUUID(), name: "Legacy Plan", price: 49, status: "Inactive", picture: "https://picsum.photos/100?3", quantity: 12 }
  ],
  notifications: [
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
  ],
  settings: {
    name: "Admin User",
    email: "admin@demo.com",
    theme: "light"
  }
};

export function getData(key) {
  const value = localStorage.getItem(key);
  if (!value) {
    return null;
  }
  return JSON.parse(value);
}

export function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedStorage() {
  Object.entries(KEYS).forEach(([name, key]) => {
    if (!localStorage.getItem(key)) {
      setData(key, DEFAULTS[name]);
    }
  });
}

export function getUsers() {
  return getData(KEYS.users) || [];
}

export function setUsers(users) {
  setData(KEYS.users, users);
}

export function getProducts() {
  return getData(KEYS.products) || [];
}

export function setProducts(products) {
  setData(KEYS.products, products);
}

export function getNotifications() {
  return getData(KEYS.notifications) || [];
}

export function setNotifications(items) {
  setData(KEYS.notifications, items);
}

export function getSettings() {
  return getData(KEYS.settings) || { ...DEFAULTS.settings };
}

export function setSettings(settings) {
  setData(KEYS.settings, settings);
}
