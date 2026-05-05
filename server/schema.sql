CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investment_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  average_rate NUMERIC(6, 4) NOT NULL,
  risk TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  plan_id TEXT REFERENCES investment_plans(id),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_metrics (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_history (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  value NUMERIC(12, 2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  plan_id TEXT NOT NULL REFERENCES investment_plans(id),
  investment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES investment_plans(id),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO investment_plans (id, title, average_rate, risk)
VALUES
  ('start', 'Старт', 0.065, 'Низкий риск'),
  ('balance', 'Баланс', 0.125, 'Средний риск'),
  ('pro', 'Про', 0.200, 'Высокий риск')
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    average_rate = EXCLUDED.average_rate,
    risk = EXCLUDED.risk;

INSERT INTO portfolio_metrics (id, label, value, sort_order)
VALUES
  ('balance', 'Баланс', '$12,450', 1),
  ('profit', 'Доходность', '+18%', 2),
  ('assets', 'Активы', '8', 3)
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    value = EXCLUDED.value,
    sort_order = EXCLUDED.sort_order;

INSERT INTO portfolio_history (label, value, sort_order)
SELECT seed.label, seed.value, seed.sort_order
FROM (
  VALUES
    ('Jan', 9400, 1),
    ('Feb', 10150, 2),
    ('Mar', 9800, 3),
    ('Apr', 11050, 4),
    ('May', 11600, 5),
    ('Jun', 12450, 6)
) AS seed(label, value, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_history);
