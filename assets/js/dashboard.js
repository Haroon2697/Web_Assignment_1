import { initProtectedPage } from "./ui.js";
import { getProducts, getUsers } from "./storage.js";

initProtectedPage("dashboard.html");

const users = getUsers();
const products = getProducts();

document.getElementById("totalUsers").textContent = users.length;
document.getElementById("totalOrders").textContent = products.reduce((sum, product) => sum + Number(product.quantity), 0);
document.getElementById("revenue").textContent = `$${products
  .reduce((sum, product) => sum + Number(product.price) * Number(product.quantity), 0)
  .toLocaleString()}`;

function readCssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function chartTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const primary = readCssVar("--primary", isDark ? "#2dd4bf" : "#0d9488");
  const muted = readCssVar("--muted-light", isDark ? "#94a3b8" : "#64748b");
  const text = readCssVar("--text", isDark ? "#f1f5f9" : "#0b1222");
  const grid = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.06)";
  const surfaceLine = isDark ? "rgba(45, 212, 191, 0.35)" : "rgba(13, 148, 136, 0.35)";
  return { isDark, primary, muted, text, grid, surfaceLine };
}

function baseChartOptions(theme) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.96)",
        titleColor: theme.text,
        bodyColor: theme.muted,
        borderColor: theme.surfaceLine,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: theme.muted, font: { size: 11, weight: "600" } },
        border: { color: theme.grid }
      },
      y: {
        beginAtZero: true,
        grid: { color: theme.grid },
        ticks: { color: theme.muted, font: { size: 11, weight: "600" } },
        border: { display: false }
      }
    }
  };
}

const theme = chartTheme();
const revenueCtx = document.getElementById("revenueChart");
const growthCtx = document.getElementById("growthChart");

const chartOptions = baseChartOptions(theme);

/** Mock datasets for Revenue chart toggles */
const REVENUE_DATA = {
  "6m": {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [4000, 5500, 6100, 7200, 8000, 9300]
  },
  ytd: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [3200, 4100, 5200, 6100, 7000, 7800, 8500, 9100, 9800, 10200, 10800, 11500]
  }
};

/** Mock datasets for User growth — monthly vs weekly resolution */
const GROWTH_DATA = {
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    values: [20, 35, 50, 69, 88, 110]
  },
  weekly: {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
    values: [14, 22, 31, 44, 58, 72, 91, 105]
  }
};

function barBackground(context) {
  const { chart } = context;
  const { ctx, chartArea } = chart;
  if (!chartArea) return theme.primary;
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, theme.isDark ? "rgba(45, 212, 191, 0.88)" : "rgba(13, 148, 136, 0.92)");
  g.addColorStop(1, theme.isDark ? "rgba(56, 189, 248, 0.38)" : "rgba(8, 145, 178, 0.48)");
  return g;
}

function growthAreaFill(context) {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return "transparent";
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, theme.isDark ? "rgba(45, 212, 191, 0.22)" : "rgba(13, 148, 136, 0.18)");
  g.addColorStop(1, "rgba(13, 148, 136, 0)");
  return g;
}

const revenueChart = new Chart(revenueCtx, {
  type: "bar",
  data: {
    labels: [...REVENUE_DATA.ytd.labels],
    datasets: [
      {
        label: "Revenue",
        data: [...REVENUE_DATA.ytd.values],
        backgroundColor: barBackground,
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 36
      }
    ]
  },
  options: chartOptions
});

const growthChart = new Chart(growthCtx, {
  type: "line",
  data: {
    labels: [...GROWTH_DATA.monthly.labels],
    datasets: [
      {
        label: "Users",
        data: [...GROWTH_DATA.monthly.values],
        borderColor: theme.primary,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.primary,
        pointHoverBorderColor: theme.isDark ? "#0f172a" : "#fff",
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: growthAreaFill
      }
    ]
  },
  options: chartOptions
});

function setActiveSegment(container, activeButton) {
  if (!container) return;
  container.querySelectorAll(".dash-segment").forEach((btn) => {
    btn.classList.toggle("is-active", btn === activeButton);
  });
}

const revenueSegments = document.getElementById("revenueSegments");
if (revenueSegments) {
  revenueSegments.querySelectorAll("[data-revenue-range]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const range = btn.dataset.revenueRange;
      const payload = REVENUE_DATA[range];
      if (!payload) return;
      revenueChart.data.labels = [...payload.labels];
      revenueChart.data.datasets[0].data = [...payload.values];
      revenueChart.update();
      setActiveSegment(revenueSegments, btn);
    });
  });
}

const growthSegments = document.getElementById("growthSegments");
if (growthSegments) {
  growthSegments.querySelectorAll("[data-growth-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.growthMode;
      const payload = GROWTH_DATA[mode];
      if (!payload) return;
      growthChart.data.labels = [...payload.labels];
      growthChart.data.datasets[0].data = [...payload.values];
      growthChart.update();
      setActiveSegment(growthSegments, btn);
    });
  });
}
