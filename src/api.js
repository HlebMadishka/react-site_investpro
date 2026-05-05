const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const USER_TOKEN_KEY = "investpro_user_token";
const ADMIN_TOKEN_KEY = "investpro_admin_token";

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY) ?? "";
}

export function setUserToken(token) {
  localStorage.setItem(USER_TOKEN_KEY, token);
}

export function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) ?? "";
}

export function setAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request(path, options) {
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "API request failed");
  }

  return data;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    headers: authHeaders(getUserToken()),
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAccount() {
  return request("/api/auth/me", {
    headers: authHeaders(getUserToken()),
  });
}

export function loginAdmin(password) {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function getAdminLeads() {
  return request("/api/admin/leads", {
    headers: authHeaders(getAdminToken()),
  });
}

export function getAdminSubscriptions() {
  return request("/api/admin/subscriptions", {
    headers: authHeaders(getAdminToken()),
  });
}

export function getAdminUsers() {
  return request("/api/admin/users", {
    headers: authHeaders(getAdminToken()),
  });
}

export function updateAdminPlan(id, payload) {
  return request(`/api/admin/plans/${id}`, {
    method: "PUT",
    headers: authHeaders(getAdminToken()),
    body: JSON.stringify(payload),
  });
}
