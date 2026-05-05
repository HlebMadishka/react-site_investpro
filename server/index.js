import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkDb, initDb, pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(__dirname, "../dist");

if (process.env.CLIENT_URL) {
  app.use(cors({ origin: process.env.CLIENT_URL }));
}
app.use(express.json());

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

app.get("/api/plans", async (_request, response, next) => {
  try {
    const result = await pool.query(`
      SELECT id, title, average_rate AS "averageRate", risk
      FROM investment_plans
      ORDER BY average_rate ASC;
    `);

    response.json(result.rows);
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
    const { name, email, planId = "balance", message = "" } = request.body;

    if (!name || !email) {
      return response.status(400).json({
        message: "Name and email are required.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO leads (name, email, plan_id, message)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, plan_id AS "planId", message, created_at AS "createdAt";
      `,
      [name, email, planId, message],
    );

    return response.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/subscriptions", async (request, response, next) => {
  try {
    const { planId, investmentAmount = 0 } = request.body;

    if (!planId) {
      return response.status(400).json({
        message: "Plan id is required.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO subscriptions (plan_id, investment_amount)
        VALUES ($1, $2)
        RETURNING
          id,
          plan_id AS "planId",
          investment_amount AS "investmentAmount",
          created_at AS "createdAt";
      `,
      [planId, Number(investmentAmount) || 0],
    );

    return response.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return response.status(400).json({
        message: "Selected plan does not exist.",
      });
    }

    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Server error." });
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
