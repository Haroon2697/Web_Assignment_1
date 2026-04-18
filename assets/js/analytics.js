import { initProtectedPage } from "./ui.js";

initProtectedPage("analytics.html");

const isDark = document.documentElement.classList.contains("dark");
const rootStyle = getComputedStyle(document.documentElement);
const primary = rootStyle.getPropertyValue("--primary").trim() || (isDark ? "#2dd4bf" : "#0d9488");
const muted = rootStyle.getPropertyValue("--muted-light").trim() || (isDark ? "#94a3b8" : "#64748b");
const text = rootStyle.getPropertyValue("--text").trim() || (isDark ? "#f1f5f9" : "#0b1222");
const grid = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(15, 23, 42, 0.08)";

const tooltip = {
  backgroundColor: isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.98)",
  titleColor: text,
  bodyColor: muted,
  borderColor: isDark ? "rgba(45, 212, 191, 0.35)" : "rgba(13, 148, 136, 0.35)",
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8
};

const scalesXY = {
  x: {
    grid: { color: grid },
    ticks: { color: muted, maxRotation: 45, minRotation: 0, font: { size: 10 } }
  },
  y: {
    grid: { color: grid },
    ticks: { color: muted, font: { size: 10 } }
  }
};

/** Single-row stacked horizontal bar: channel share of active users */
new Chart(document.getElementById("chartChannels"), {
  type: "bar",
  data: {
    labels: [""],
    datasets: [
      { label: "Organic", data: [4], backgroundColor: "#22c55e" },
      { label: "Direct", data: [2], backgroundColor: "#3b82f6" },
      { label: "Referral", data: [2], backgroundColor: "#eab308" },
      { label: "Social", data: [2], backgroundColor: "#a855f7" }
    ]
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { stacked: true, max: 10, grid: { display: false }, ticks: { display: false } },
      y: { stacked: true, grid: { display: false }, ticks: { display: false } }
    }
  }
});

/** Pageviews last 30 minutes — mock bar series */
new Chart(document.getElementById("chartPageviews"), {
  type: "bar",
  data: {
    labels: ["-30", "-25", "-20", "-15", "-10", "-5", "now"],
    datasets: [
      {
        label: "Pageviews",
        data: [12, 19, 14, 22, 28, 24, 31],
        backgroundColor: "#4285f4",
        borderRadius: 4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { grid: { display: false }, ticks: { color: muted, font: { size: 9 } } },
      y: { beginAtZero: true, grid: { color: grid }, ticks: { color: muted, font: { size: 9 } } }
    }
  }
});

/** Stacked bar: sessions by channel, male vs female (mock) */
new Chart(document.getElementById("chartSessionsStacked"), {
  type: "bar",
  data: {
    labels: ["Organic", "Direct", "Referral", "Social", "Email"],
    datasets: [
      { label: "Male", data: [420, 310, 180, 95, 140], backgroundColor: "#3b82f6" },
      { label: "Female", data: [380, 260, 150, 110, 120], backgroundColor: "#f97316" }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { color: muted, boxWidth: 12, padding: 12 } },
      tooltip
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: muted } },
      y: { stacked: true, grid: { color: grid }, ticks: { color: muted } }
    }
  }
});

/** Revenue by metro — vertical bars */
new Chart(document.getElementById("chartMetro"), {
  type: "bar",
  data: {
    labels: ["NYC", "LA", "Chicago", "Houston", "Phoenix"],
    datasets: [
      {
        label: "Revenue ($)",
        data: [8200, 6100, 4800, 3900, 3200],
        backgroundColor: ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
        borderRadius: 6
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: scalesXY
  }
});

/** Revenue sparkline — line */
new Chart(document.getElementById("chartRevenueSpark"), {
  type: "line",
  data: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [3200, 4100, 3800, 5200, 4900, 6100, 5750],
        borderColor: "#4285f4",
        backgroundColor: "rgba(66, 133, 244, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  }
});

/** Donut — social sessions */
new Chart(document.getElementById("chartSocialDonut"), {
  type: "doughnut",
  data: {
    labels: ["Twitter", "Facebook", "Google+", "LinkedIn", "Stack Overflow", "Other"],
    datasets: [
      {
        data: [420, 380, 120, 290, 210, 419],
        backgroundColor: ["#1da1f2", "#1877f2", "#ea4335", "#0a66c2", "#f48024", "#94a3b8"],
        borderWidth: 2,
        borderColor: isDark ? "#1e293b" : "#ffffff"
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: muted, boxWidth: 10, font: { size: 9 }, padding: 6 }
      },
      tooltip
    }
  }
});

/** Horizontal bar — pages per session by device */
new Chart(document.getElementById("chartDeviceHorizontal"), {
  type: "bar",
  data: {
    labels: ["Desktop", "Mobile", "Tablet"],
    datasets: [
      {
        label: "Pages / session",
        data: [4.2, 3.1, 3.8],
        backgroundColor: "#4285f4",
        borderRadius: 4
      }
    ]
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip },
    scales: {
      x: {
        beginAtZero: true,
        max: 6,
        grid: { color: grid },
        ticks: { color: muted }
      },
      y: {
        grid: { display: false },
        ticks: { color: muted }
      }
    }
  }
});
