import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createToken, getBearerToken, hashPassword, parseToken, verifyPassword } from "./auth.js";
import { checkDb, initDb, pool } from "./db.js";
import { sendLeadNotification } from "./notifications.js";
import { validateAuth, validateLead, validatePlan, validateSubscription } from "./validation.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../dist");
const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

const rateBuckets = new Map();

function securityHeaders(_request, response, next) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function cors(request, response, next) {
  const allowedOrigin = process.env.CLIENT_URL;

  if (allowedOrigin && request.headers.origin === allowedOrigin) {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");

  if (request.method === "OPTIONS") {
    return response.sendStatus(204);
  }

  return next();
}

function rateLimit(limit = 80, windowMs = 1000 * 60) {
  return (request, response, next) => {
    const key = `${request.ip}:${request.path}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) ?? { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt < now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    rateBuckets.set(key, bucket);

    if (bucket.count > limit) {
      return response.status(429).json({ message: "Too many requests. Try again later." });
    }

    return next();
  };
}

async function optionalUser(request, _response, next) {
  const payload = parseToken(getBearerToken(request));
  request.user = payload?.role === "user" ? payload : null;
  next();
}

async function requireUser(request, response, next) {
  const payload = parseToken(getBearerToken(request));

  if (payload?.role !== "user") {
    return response.status(401).json({ message: "Login required." });
  }

  request.user = payload;
  return next();
}

async function requireAdmin(request, response, next) {
  const payload = parseToken(getBearerToken(request));

  if (payload?.role !== "admin") {
    return response.status(401).json({ message: "Admin login required." });
  }

  request.admin = payload;
  return next();
}

app.use(securityHeaders);
app.use(cors);
app.use(express.json({ limit: "32kb" }));
app.use("/api", rateLimit());
app.use("/api/leads", rateLimit(10, 1000 * 60 * 10));
app.use("/api/auth", rateLimit(20, 1000 * 60 * 10));
app.use("/api/admin", rateLimit(40, 1000 * 60 * 10));

app.get("/api/health", async (_request, response) => {
  try {
    const dbTime = await checkDb();

    response.json({
      status: "ok",
      database: "connected",
      dbTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    response.status(503).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const { value, error } = validateAuth(request.body, "register");

    if (error) {
      return response.status(400).json({ message: error });
    }

    const result = await pool.query(
      `
        INSERT INTO users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at AS "createdAt";
      `,
      [value.name, value.email, hashPassword(value.password)],
    );
    const user = result.rows[0];
    const token = createToken({ role: "user", userId: user.id, email: user.email });

    return response.status(201).json({ token, user });
  } catch (error) {
    if (error.code === "23505") {
      return response.status(409).json({ message: "User with this email already exists." });
    }

    return next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const { value, error } = validateAuth(request.body);

    if (error) {
      return response.status(400).json({ message: error });
    }

    const result = await pool.query(
      `
        SELECT id, name, email, password_hash, created_at AS "createdAt"
        FROM users
        WHERE email = $1;
      `,
      [value.email],
    );
    const user = result.rows[0];

    if (!user || !verifyPassword(value.password, user.password_hash)) {
      return response.status(401).json({ message: "Invalid email or password." });
    }

    delete user.password_hash;

    return response.json({
      token: createToken({ role: "user", userId: user.id, email: user.email }),
      user,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/auth/me", requireUser, async (request, response, next) => {
  try {
    const userResult = await pool.query(
      `
        SELECT id, name, email, created_at AS "createdAt"
        FROM users
        WHERE id = $1;
      `,
      [request.user.userId],
    );
    const investmentsResult = await pool.query(
      `
        SELECT
          i.id,
          i.amount,
          i.status,
          i.created_at AS "createdAt",
          p.id AS "planId",
          p.title AS "planTitle",
          p.average_rate AS "averageRate",
          p.risk
        FROM investments i
        JOIN investment_plans p ON p.id = i.plan_id
        WHERE i.user_id = $1
        ORDER BY i.created_at DESC;
      `,
      [request.user.userId],
    );

    return response.json({
      user: userResult.rows[0],
      investments: investmentsResult.rows.map((item) => ({
        ...item,
        amount: Number(item.amount),
        averageRate: Number(item.averageRate),
      })),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/admin/login", async (request, response) => {
  const password = String(request.body.password ?? "");

  if (password !== adminPassword) {
    return response.status(401).json({ message: "Invalid admin password." });
  }

  return response.json({
    token: createToken({ role: "admin" }),
  });
});

app.get("/api/plans", async (_request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT id, title, average_rate AS "averageRate", risk
      FROM investment_plans
      ORDER BY average_rate ASC;
    `);

    response.json(result.rows.map((plan) => ({
      ...plan,
      averageRate: Number(plan.averageRate),
    })));
  } catch (error) {
    next(error);
  }
});

app.get("/api/portfolio", async (_request, response, next) => {
  try {
    const [metricsResult, historyResult] = await Promise.all([
      pool.query(`
        SELECT id, label, value
        FROM portfolio_metrics
        ORDER BY sort_order ASC;
      `),
      pool.query(`
        SELECT label, value
        FROM portfolio_history
        ORDER BY sort_order ASC;
      `),
    ]);

    response.json({
      metrics: metricsResult.rows,
      history: historyResult.rows.map((row) => ({
        label: row.label,
        value: Number(row.value),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/leads", async (request, response, next) => {
  try {
    const { value, error } = validateLead(request.body);

    if (error) {
      return response.status(400).json({ message: error });
    }

    const result = await pool.query(
      `
        INSERT INTO leads (name, email, plan_id, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, plan_id AS "planId", message, created_at AS "createdAt";
      `,
      [value.name, value.email, value.planId, value.message],
    );
    const lead = result.rows[0];

    sendLeadNotification(lead).catch((error) => {
      console.error("Lead notification failed:", error.message);
    });

    return response.status(201).json(lead);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/subscriptions", optionalUser, async (request, response, next) => {
  try {
    const { value, error } = validateSubscription(request.body);

    if (error) {
      return response.status(400).json({ message: error });
    }

    const result = await pool.query(
      `
        INSERT INTO subscriptions (user_id, plan_id, investment_amount)
        VALUES ($1, $2, $3)
        RETURNING
          id,
          user_id AS "userId",
          plan_id AS "planId",
          investment_amount AS "investmentAmount",
          created_at AS "createdAt";
      `,
      [request.user?.userId ?? null, value.planId, value.investmentAmount],
    );

    if (request.user?.userId && value.investmentAmount > 0) {
      await pool.query(
        `
          INSERT INTO investments (user_id, plan_id, amount)
          VALUES ($1, $2, $3);
        `,
        [request.user.userId, value.planId, value.investmentAmount],
      );
    }

    return response.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return response.status(400).json({ message: "Selected plan does not exist." });
    }

    return next(error);
  }
});

app.get("/api/admin/leads", requireAdmin, async (_request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, plan_id AS "planId", message, created_at AS "createdAt"
      FROM leads
      ORDER BY created_at DESC
      LIMIT 100;
    `);

    return response.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/subscriptions", requireAdmin, async (_request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.user_id AS "userId",
        u.email AS "userEmail",
        s.plan_id AS "planId",
        s.investment_amount AS "investmentAmount",
        s.created_at AS "createdAt"
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
      LIMIT 100;
    `);

    return response.json(result.rows.map((item) => ({
      ...item,
      investmentAmount: Number(item.investmentAmount),
    })));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/users", requireAdmin, async (_request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at AS "createdAt"
      FROM users
      ORDER BY created_at DESC
      LIMIT 100;
    `);

    return response.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

app.put("/api/admin/plans/:id", requireAdmin, async (request, response, next) => {
  try {
    const { value, error } = validatePlan(request.body);

    if (error) {
      return response.status(400).json({ message: error });
    }

    const result = await pool.query(
      `
        UPDATE investment_plans
        SET title = $1, average_rate = $2, risk = $3
        WHERE id = $4
        RETURNING id, title, average_rate AS "averageRate", risk;
      `,
      [value.title, value.averageRate, value.risk, request.params.id],
    );

    if (!result.rows[0]) {
      return response.status(404).json({ message: "Plan not found." });
    }

    return response.json({
      ...result.rows[0],
      averageRate: Number(result.rows[0].averageRate),
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Server error." : error.message,
  });
});

app.use(express.static(clientDistPath));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(clientDistPath, "index.html"));
});

try {
  await initDb();
  app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Failed to start API server:", error);
  process.exit(1);
}
