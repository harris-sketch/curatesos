const dashboardState = {
  data: null,
  source: "loading",
  query: "",
};

const elements = {
  connectionStatus: document.querySelector("#connectionStatus"),
  refreshButton: document.querySelector("#refreshButton"),
  healthScore: document.querySelector("#healthScore"),
  healthSummary: document.querySelector("#healthSummary"),
  healthRing: document.querySelector("#healthRing"),
  lastUpdated: document.querySelector("#lastUpdated"),
  sitesMonitored: document.querySelector("#sitesMonitored"),
  deploySuccessRate: document.querySelector("#deploySuccessRate"),
  activeForms: document.querySelector("#activeForms"),
  connectedTools: document.querySelector("#connectedTools"),
  averageDeployTime: document.querySelector("#averageDeployTime"),
  activityList: document.querySelector("#activityList"),
  alertStack: document.querySelector("#alertStack"),
  connectionList: document.querySelector("#connectionList"),
  siteGrid: document.querySelector("#siteGrid"),
  siteSearch: document.querySelector("#siteSearch"),
  recommendationList: document.querySelector("#recommendationList"),
  emptyStateTemplate: document.querySelector("#emptyStateTemplate"),
};

document.addEventListener("DOMContentLoaded", () => {
  elements.refreshButton.addEventListener("click", loadDashboard);
  elements.siteSearch.addEventListener("input", (event) => {
    dashboardState.query = event.target.value.trim().toLowerCase();
    renderSites();
  });

  loadDashboard();
});

async function loadDashboard() {
  setConnectionStatus("Connecting to Netlify", "loading");
  elements.refreshButton.disabled = true;

  try {
    const liveResponse = await fetch("/api/netlify-dashboard", {
      headers: { accept: "application/json" },
    });

    if (!liveResponse.ok) {
      const setupDetails = await safeJson(liveResponse);
      throw new Error(setupDetails?.message || "Live Netlify feed is not configured yet.");
    }

    dashboardState.data = await liveResponse.json();
    dashboardState.source = "live";
    setConnectionStatus("Live Netlify feed", "connected");
  } catch (error) {
    const sampleResponse = await fetch("/sample-data.json", {
      headers: { accept: "application/json" },
    });

    if (!sampleResponse.ok) {
      setConnectionStatus("Dashboard data unavailable", "error");
      throw error;
    }

    dashboardState.data = await sampleResponse.json();
    dashboardState.source = "demo";
    setConnectionStatus("Demo mode - add NETLIFY_AUTH_TOKEN", "demo");
  } finally {
    elements.refreshButton.disabled = false;
  }

  renderDashboard();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function renderDashboard() {
  const data = dashboardState.data;
  if (!data) {
    return;
  }

  const metrics = data.metrics || {};
  const healthScore = firstNumber(metrics.latestDeployHealth, metrics.deploySuccessRate, 0);
  const generatedAt = data.generatedAt ? formatDateTime(data.generatedAt) : "pending";

  elements.healthScore.textContent = healthScore;
  elements.healthSummary.textContent =
    healthScore >= 95
      ? "Portfolio posture is operating within institutional tolerances."
      : healthScore >= 80
        ? "Portfolio posture is stable with a few items to review."
        : "Operational posture needs attention before the next release.";
  elements.healthRing.style.background = `conic-gradient(var(--brand) ${healthScore * 3.6}deg, rgba(148, 163, 184, 0.15) 0deg)`;
  elements.lastUpdated.textContent = `Last updated: ${generatedAt}${dashboardState.source === "demo" ? " (demo data)" : ""}`;
  elements.sitesMonitored.textContent = numberOrDash(metrics.sitesMonitored);
  elements.deploySuccessRate.textContent = percentOrDash(metrics.deploySuccessRate);
  elements.activeForms.textContent = numberOrDash(metrics.activeForms);
  elements.connectedTools.textContent = `${numberOrDash(metrics.connectedTools)}/4`;
  elements.averageDeployTime.textContent = `Avg deploy: ${formatDuration(metrics.averageDeploySeconds)}`;

  renderActivity(data.activity || []);
  renderAlerts(data.alerts || []);
  renderConnections(data.connections || []);
  renderRecommendations(data.recommendations || []);
  renderSites();
}

function renderActivity(activity) {
  if (!activity.length) {
    renderEmpty(elements.activityList);
    return;
  }

  elements.activityList.innerHTML = activity
    .map((deploy) => {
      const stateClass = deployStateClass(deploy.state);
      const deployUrl = safeUrl(deploy.adminUrl || deploy.deployUrl || deploy.siteAdminUrl);

      return `
        <article class="activity-item">
          <span class="state-pill ${stateClass}">${escapeHtml(deploy.state || "unknown")}</span>
          <div class="activity-main">
            <strong>${escapeHtml(deploy.siteName || "Unknown site")}</strong>
            <p>${escapeHtml(deploy.title || deploy.branch || "Deploy")} · ${formatRelativeTime(deploy.createdAt || deploy.updatedAt)}</p>
          </div>
          ${deployUrl ? `<a href="${deployUrl}" target="_blank" rel="noreferrer">Open</a>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderAlerts(alerts) {
  if (!alerts.length) {
    renderEmpty(elements.alertStack);
    return;
  }

  elements.alertStack.innerHTML = alerts
    .map(
      (alert) => `
        <article class="alert-card">
          <header>
            <strong>${escapeHtml(alert.title)}</strong>
            <span class="severity-pill ${escapeHtml(alert.severity || "notice")}">${escapeHtml(alert.severity || "notice")}</span>
          </header>
          <p>${escapeHtml(alert.detail || "")}</p>
        </article>
      `,
    )
    .join("");
}

function renderConnections(connections) {
  if (!connections.length) {
    renderEmpty(elements.connectionList);
    return;
  }

  elements.connectionList.innerHTML = connections
    .map(
      (connection) => `
        <article class="connection-row">
          <div>
            <strong>${escapeHtml(connection.name)}</strong>
            <p>${escapeHtml(connection.detail || "")}</p>
          </div>
          <span class="state-pill ${connection.status === "connected" ? "success" : "pending"}">${escapeHtml(connection.status)}</span>
        </article>
      `,
    )
    .join("");
}

function renderSites() {
  const data = dashboardState.data;
  const query = dashboardState.query;
  const sites = (data?.sites || []).filter((site) => {
    if (!query) {
      return true;
    }

    return [site.name, site.branch, site.customDomain, site.url, site.accountName]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  if (!sites.length) {
    renderEmpty(elements.siteGrid);
    return;
  }

  elements.siteGrid.innerHTML = sites
    .map((site) => {
      const latestDeploy = site.latestDeploy || {};
      const stateClass = deployStateClass(latestDeploy.state || site.state);
      const siteUrl = safeUrl(site.url);
      const adminUrl = safeUrl(site.adminUrl);

      return `
        <article class="site-card">
          <div class="site-card-header">
            <h3 title="${escapeHtml(site.name)}">${escapeHtml(site.name)}</h3>
            <span class="state-pill ${stateClass}">${escapeHtml(latestDeploy.state || site.state || "unknown")}</span>
          </div>
          <div class="site-meta">
            <span>Account: ${escapeHtml(site.accountName || "Netlify")}</span>
            <span>Branch: ${escapeHtml(site.branch || latestDeploy.branch || "Not set")}</span>
            <span>Forms: ${numberOrDash(site.activeForms)}</span>
            <span>Updated: ${formatRelativeTime(site.updatedAt || latestDeploy.updatedAt)}</span>
          </div>
          <div class="site-card-footer">
            ${siteUrl ? `<a href="${siteUrl}" target="_blank" rel="noreferrer">Visit site</a>` : "<span></span>"}
            ${adminUrl ? `<a href="${adminUrl}" target="_blank" rel="noreferrer">Netlify admin</a>` : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecommendations(recommendations) {
  if (!recommendations.length) {
    renderEmpty(elements.recommendationList);
    return;
  }

  elements.recommendationList.innerHTML = recommendations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderEmpty(target) {
  target.innerHTML = "";
  target.appendChild(elements.emptyStateTemplate.content.cloneNode(true));
}

function setConnectionStatus(message, mode) {
  elements.connectionStatus.textContent = message;
  elements.connectionStatus.className = `status-pill ${mode}`;
}

function deployStateClass(state = "") {
  const normalized = state.toLowerCase();
  if (["ready", "uploaded"].includes(normalized)) {
    return "success";
  }

  if (["error", "failed", "canceled"].includes(normalized)) {
    return "danger";
  }

  return "pending";
}

function firstNumber(...values) {
  const value = values.find((candidate) => Number.isFinite(candidate));
  return value ?? 0;
}

function numberOrDash(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat("en").format(value) : "--";
}

function percentOrDash(value) {
  return Number.isFinite(value) ? `${value}%` : "--";
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "--";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "pending";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) {
    return "No timestamp";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No timestamp";
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    const amount = Math.trunc(diffSeconds / seconds);
    if (Math.abs(amount) >= 1) {
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(amount, unit);
    }
  }

  return "just now";
}

function safeUrl(value) {
  if (!value || !/^https?:\/\//i.test(value)) {
    return "";
  }

  return value;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
