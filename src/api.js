const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "API request failed");
  }

  return data;
}

export function getHealth() {
  return request("/api/health");
}

export function getPlans() {
  return request("/api/plans");
}

export function getPortfolio() {
  return request("/api/portfolio");
}

export function createLead(payload) {
  return request("/api/leads", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createSubscription(payload) {
  return request("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
