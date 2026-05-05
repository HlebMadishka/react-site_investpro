export function cleanString(value, maxLength = 255) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

export function validateLead(body = {}) {
  const lead = {
    name: cleanString(body.name, 120),
    email: cleanString(body.email, 180).toLowerCase(),
    planId: cleanString(body.planId || "balance", 40),
    message: cleanString(body.message, 2000),
  };

  if (lead.name.length < 2) {
    return { error: "Name must contain at least 2 characters." };
  }

  if (!isEmail(lead.email)) {
    return { error: "Valid email is required." };
  }

  return { value: lead };
}

export function validateSubscription(body = {}) {
  const planId = cleanString(body.planId, 40);
  const investmentAmount = Number(body.investmentAmount);

  if (!planId) {
    return { error: "Plan id is required." };
  }

  if (!Number.isFinite(investmentAmount) || investmentAmount < 0) {
    return { error: "Investment amount must be a positive number." };
  }

  return { value: { planId, investmentAmount } };
}

export function validatePlan(body = {}) {
  const plan = {
    title: cleanString(body.title, 120),
    averageRate: Number(body.averageRate),
    risk: cleanString(body.risk, 120),
  };

  if (!plan.title) {
    return { error: "Plan title is required." };
  }

  if (!Number.isFinite(plan.averageRate) || plan.averageRate < 0 || plan.averageRate > 1) {
    return { error: "Average rate must be between 0 and 1." };
  }

  if (!plan.risk) {
    return { error: "Risk label is required." };
  }

  return { value: plan };
}

export function validateAuth(body = {}, mode = "login") {
  const auth = {
    name: cleanString(body.name, 120),
    email: cleanString(body.email, 180).toLowerCase(),
    password: String(body.password ?? ""),
  };

  if (mode === "register" && auth.name.length < 2) {
    return { error: "Name must contain at least 2 characters." };
  }

  if (!isEmail(auth.email)) {
    return { error: "Valid email is required." };
  }

  if (auth.password.length < 8) {
    return { error: "Password must contain at least 8 characters." };
  }

  return { value: auth };
}
