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

function barBackground(context) {
  const { chart } = context;
  const { ctx, chartArea } = chart;
  if (!chartArea) return theme.primary;
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, theme.isDark ? "rgba(45, 212, 191, 0.88)" : "rgba(13, 148, 136, 0.92)");
  g.addColorStop(1, theme.isDark ? "rgba(56, 189, 248, 0.38)" : "rgba(8, 145, 178, 0.48)");
  return g;
}

new Chart(revenueCtx, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [4000, 5500, 6100, 7200, 8000, 9300],
        backgroundColor: barBackground,
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 36
      }
    ]
  },
  options: chartOptions
});

new Chart(growthCtx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: [20, 35, 50, 69, 88, 110],
        borderColor: theme.primary,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: theme.primary,
        pointHoverBorderColor: theme.isDark ? "#0f172a" : "#fff",
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor(context) {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return "transparent";
          const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0, theme.isDark ? "rgba(45, 212, 191, 0.22)" : "rgba(13, 148, 136, 0.18)");
          g.addColorStop(1, "rgba(13, 148, 136, 0)");
          return g;
        }
      }
    ]
  },
  options: chartOptions
});
