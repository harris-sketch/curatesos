const NETLIFY_API_BASE = process.env.NETLIFY_API_BASE || "https://api.netlify.com/api/v1";
const DEFAULT_SITE_LIMIT = 24;
const DEFAULT_DETAIL_LIMIT = 8;
const REQUEST_TIMEOUT_MS = 9000;

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-headers": "content-type",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, null);
  }

  if (event.httpMethod !== "GET") {
    return response(405, {
      error: "method_not_allowed",
      message: "Use GET to retrieve the Netlify dashboard feed.",
    });
  }

  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) {
    return response(503, {
      error: "netlify_auth_token_missing",
      message: "Set NETLIFY_AUTH_TOKEN in Netlify environment variables to connect live business tooling.",
      requiredEnvironment: ["NETLIFY_AUTH_TOKEN"],
      optionalEnvironment: ["NETLIFY_ACCOUNT_SLUG", "NETLIFY_SITE_IDS", "NETLIFY_SITE_LIMIT", "NETLIFY_DETAIL_LIMIT"],
    });
  }

  try {
    const query = event.queryStringParameters || {};
    const siteLimit = clampInteger(query.limit || process.env.NETLIFY_SITE_LIMIT, 1, 100, DEFAULT_SITE_LIMIT);
    const detailLimit = clampInteger(query.detailLimit || process.env.NETLIFY_DETAIL_LIMIT, 0, siteLimit, DEFAULT_DETAIL_LIMIT);
    const configuredSiteIds = splitCsv(process.env.NETLIFY_SITE_IDS);
    const accountSlug = process.env.NETLIFY_ACCOUNT_SLUG || "";

    const api = createNetlifyClient(token);
    const rawSites = await api.get("/sites", { per_page: 100 });
    const filteredSites = filterSites(rawSites, { accountSlug, configuredSiteIds }).slice(0, siteLimit);
    const detailedSites = await enrichSites(api, filteredSites, detailLimit);
    const dashboard = buildDashboardPayload(detailedSites, {
      accountSlug,
      configuredSiteIds,
      siteLimit,
      detailLimit,
    });

    return response(200, dashboard);
  } catch (error) {
    return response(error.statusCode || 502, {
      error: "netlify_dashboard_unavailable",
      message: error.message || "Unable to load Netlify dashboard data.",
      upstreamStatus: error.statusCode,
    });
  }
};

function createNetlifyClient(token) {
  return {
    async get(path, params = {}) {
      const url = new URL(`${NETLIFY_API_BASE}${path}`);
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value);
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const result = await fetch(url, {
          headers: {
            authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!result.ok) {
          const body = await safeReadBody(result);
          const error = new Error(body?.message || body?.error || `Netlify API request failed for ${path}`);
          error.statusCode = result.status;
          throw error;
        }

        return result.json();
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

async function safeReadBody(result) {
  try {
    return await result.json();
  } catch {
    return null;
  }
}

async function enrichSites(api, sites, detailLimit) {
  const detailedSiteIds = new Set(sites.slice(0, detailLimit).map((site) => site.id));

  const sitePromises = sites.map(async (site) => {
    if (!detailedSiteIds.has(site.id)) {
      return normalizeSite(site, [], []);
    }

    const [deploysResult, formsResult] = await Promise.allSettled([
      api.get(`/sites/${site.id}/deploys`, { per_page: 8 }),
      api.get(`/sites/${site.id}/forms`, { per_page: 20 }),
    ]);

    return normalizeSite(
      site,
      deploysResult.status === "fulfilled" ? deploysResult.value : [],
      formsResult.status === "fulfilled" ? formsResult.value : [],
      {
        deploysAvailable: deploysResult.status === "fulfilled",
        formsAvailable: formsResult.status === "fulfilled",
      },
    );
  });

  return Promise.all(sitePromises);
}

function filterSites(sites, { accountSlug, configuredSiteIds }) {
  return sites
    .filter((site) => {
      const matchesAccount = !accountSlug || site.account_slug === accountSlug || site.account_name === accountSlug;
      const matchesSiteList = configuredSiteIds.length === 0 || configuredSiteIds.includes(site.id) || configuredSiteIds.includes(site.name);
      return matchesAccount && matchesSiteList;
    })
    .sort((first, second) => new Date(second.updated_at || 0) - new Date(first.updated_at || 0));
}

function normalizeSite(site, deploys, forms, availability = {}) {
  const latestDeploy = Array.isArray(deploys) && deploys.length > 0 ? deploys[0] : null;
  const normalizedDeploys = Array.isArray(deploys) ? deploys.map(normalizeDeploy) : [];
  const activeForms = Array.isArray(forms) ? forms.filter((form) => form && form.name).length : 0;

  return {
    id: site.id,
    name: site.name,
    accountName: site.account_name || site.account_slug || "Netlify",
    adminUrl: site.admin_url,
    url: site.ssl_url || site.url,
    customDomain: site.custom_domain,
    repoUrl: site.build_settings?.repo_url || site.repo_url,
    branch: site.build_settings?.repo_branch || site.branch,
    createdAt: site.created_at,
    updatedAt: site.updated_at,
    state: site.state || "unknown",
    deploysAvailable: availability.deploysAvailable !== false,
    formsAvailable: availability.formsAvailable !== false,
    activeForms,
    latestDeploy: latestDeploy ? normalizeDeploy(latestDeploy) : null,
    deploys: normalizedDeploys,
  };
}

function normalizeDeploy(deploy) {
  const startedAt = deploy.created_at || deploy.started_at;
  const finishedAt = deploy.published_at || deploy.finished_at || deploy.updated_at;
  const durationSeconds = deploy.deploy_time || secondsBetween(startedAt, finishedAt);

  return {
    id: deploy.id,
    state: deploy.state || deploy.deploy_state || "unknown",
    title: deploy.title || deploy.commit_ref || deploy.branch || "Deploy",
    branch: deploy.branch || deploy.context,
    context: deploy.context,
    commitRef: deploy.commit_ref,
    commitUrl: deploy.commit_url,
    deployUrl: deploy.deploy_ssl_url || deploy.deploy_url,
    adminUrl: deploy.admin_url,
    createdAt: deploy.created_at,
    publishedAt: deploy.published_at,
    updatedAt: deploy.updated_at,
    durationSeconds,
    errorMessage: deploy.error_message,
    skipped: Boolean(deploy.skipped),
  };
}

function buildDashboardPayload(sites, filters) {
  const deploys = sites.flatMap((site) =>
    site.deploys.map((deploy) => ({
      ...deploy,
      siteId: site.id,
      siteName: site.name,
      siteAdminUrl: site.adminUrl,
    })),
  );
  const latestDeploys = sites.map((site) => site.latestDeploy).filter(Boolean);
  const successfulDeploys = deploys.filter((deploy) => isSuccessfulDeploy(deploy.state)).length;
  const failedDeploys = deploys.filter((deploy) => isFailedDeploy(deploy.state)).length;
  const monitoredWithDeployData = sites.filter((site) => site.deploysAvailable && site.latestDeploy).length;
  const healthyLatestDeploys = latestDeploys.filter((deploy) => isSuccessfulDeploy(deploy.state)).length;
  const averageDeploySeconds = average(
    deploys
      .map((deploy) => deploy.durationSeconds)
      .filter((duration) => Number.isFinite(duration) && duration > 0),
  );

  return {
    generatedAt: new Date().toISOString(),
    source: "netlify",
    account: {
      slug: filters.accountSlug || "all-accessible-accounts",
      siteFilterConfigured: filters.configuredSiteIds.length > 0,
    },
    filters: {
      siteLimit: filters.siteLimit,
      detailLimit: filters.detailLimit,
    },
    metrics: {
      sitesMonitored: sites.length,
      activeForms: sites.reduce((total, site) => total + site.activeForms, 0),
      deploySuccessRate: deploys.length ? Math.round((successfulDeploys / deploys.length) * 100) : null,
      latestDeployHealth: monitoredWithDeployData ? Math.round((healthyLatestDeploys / monitoredWithDeployData) * 100) : null,
      failedDeploys,
      averageDeploySeconds: averageDeploySeconds ? Math.round(averageDeploySeconds) : null,
      connectedTools: countConnectedTools(sites),
    },
    connections: buildConnections(sites),
    sites,
    activity: deploys
      .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
      .slice(0, 12),
    alerts: buildAlerts(sites, failedDeploys),
    recommendations: buildRecommendations(sites, failedDeploys, monitoredWithDeployData),
  };
}

function buildConnections(sites) {
  const hasDeployData = sites.some((site) => site.deploysAvailable);
  const hasFormData = sites.some((site) => site.formsAvailable);
  const hasRepos = sites.some((site) => site.repoUrl);

  return [
    {
      name: "Netlify Sites",
      status: sites.length ? "connected" : "attention",
      detail: `${sites.length} site${sites.length === 1 ? "" : "s"} in scope`,
    },
    {
      name: "Deploy Pipeline",
      status: hasDeployData ? "connected" : "attention",
      detail: hasDeployData ? "Recent deploy telemetry is available" : "Deploy telemetry is unavailable for the current scope",
    },
    {
      name: "Forms Intake",
      status: hasFormData ? "connected" : "attention",
      detail: hasFormData ? "Form inventory is included" : "Form inventory could not be loaded",
    },
    {
      name: "Source Control",
      status: hasRepos ? "connected" : "attention",
      detail: hasRepos ? "Repository links detected for production sites" : "Repository metadata is not available",
    },
  ];
}

function buildAlerts(sites, failedDeploys) {
  const alerts = [];
  const failedSites = sites.filter((site) => site.latestDeploy && isFailedDeploy(site.latestDeploy.state));
  const staleSites = sites.filter((site) => site.latestDeploy && daysSince(site.latestDeploy.createdAt) > 30);

  if (failedDeploys > 0) {
    alerts.push({
      severity: "critical",
      title: "Failed deploys require review",
      detail: `${failedDeploys} recent deploy${failedDeploys === 1 ? "" : "s"} returned a failure state.`,
    });
  }

  if (failedSites.length > 0) {
    alerts.push({
      severity: "warning",
      title: "Latest production posture is degraded",
      detail: failedSites.map((site) => site.name).slice(0, 4).join(", "),
    });
  }

  if (staleSites.length > 0) {
    alerts.push({
      severity: "notice",
      title: "Some sites have stale deployment activity",
      detail: `${staleSites.length} site${staleSites.length === 1 ? "" : "s"} have no deploy in the last 30 days.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      severity: "success",
      title: "No urgent Netlify operations alerts",
      detail: "Latest monitored deploys are not reporting failures.",
    });
  }

  return alerts;
}

function buildRecommendations(sites, failedDeploys, monitoredWithDeployData) {
  const recommendations = [];
  const sitesWithoutRepos = sites.filter((site) => !site.repoUrl);
  const sitesWithoutDeployData = sites.filter((site) => !site.latestDeploy);

  if (failedDeploys > 0) {
    recommendations.push("Review failed deploy logs from the activity stream and assign ownership before the next production release.");
  }

  if (sitesWithoutRepos.length > 0) {
    recommendations.push("Add repository metadata or connect source control for sites without repo links to improve operational traceability.");
  }

  if (sitesWithoutDeployData.length > 0 && monitoredWithDeployData < sites.length) {
    recommendations.push("Increase NETLIFY_DETAIL_LIMIT or narrow NETLIFY_SITE_IDS so every critical business site receives deep deploy telemetry.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep the current deploy cadence and use NETLIFY_SITE_IDS to pin the dashboard to revenue-critical properties.");
  }

  return recommendations;
}

function countConnectedTools(sites) {
  return buildConnections(sites).filter((connection) => connection.status === "connected").length;
}

function isSuccessfulDeploy(state = "") {
  return ["ready", "uploaded"].includes(state.toLowerCase());
}

function isFailedDeploy(state = "") {
  return ["error", "failed", "canceled"].includes(state.toLowerCase());
}

function secondsBetween(start, end) {
  if (!start || !end) {
    return null;
  }

  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(diff) && diff > 0 ? Math.round(diff / 1000) : null;
}

function daysSince(date) {
  if (!date) {
    return 0;
  }

  const diff = Date.now() - new Date(date).getTime();
  return Number.isFinite(diff) ? diff / 86400000 : 0;
}

function average(values) {
  if (!values.length) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function splitCsv(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function response(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: body === null ? "" : JSON.stringify(body),
  };
}
