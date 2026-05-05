import { useEffect, useMemo, useState } from "react";
import { getPortfolio } from "../api";
import { features, portfolio, stats } from "../siteData";
import BackendStatus from "../components/BackendStatus";

const cardClasses = {
  balance: "from-emerald-500/20 to-transparent",
  profit: "from-sky-500/20 to-transparent text-emerald-300",
  assets: "from-violet-500/20 to-transparent",
};

function PortfolioChart({ points }) {
  const chartPoints = points.length ? points : [];
  const values = chartPoints.map((point) => point.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const range = max - min || 1;

  const polyline = chartPoints
    .map((point, index) => {
      const x =
        chartPoints.length === 1 ? 50 : (index / (chartPoints.length - 1)) * 100;
      const y = 82 - ((point.value - min) / range) * 64;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 p-5">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label="История портфеля"
      >
        <defs>
          <linearGradient id="portfolioLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        {polyline ? (
          <polyline
            points={polyline}
            fill="none"
            stroke="url(#portfolioLine)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs text-slate-400">
        {chartPoints.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ onNavigate }) {
  const [portfolioData, setPortfolioData] = useState({
    metrics: portfolio.map((item, index) => ({
      ...item,
      id: item.label,
      sortOrder: index,
    })),
    history: [],
  });

  useEffect(() => {
    let isMounted = true;

    getPortfolio()
      .then((data) => {
        if (!isMounted) return;
        setPortfolioData({
          metrics: Array.isArray(data.metrics)
            ? data.metrics.map((metric) => ({
                ...metric,
                classes: cardClasses[metric.id] ?? "from-white/10 to-transparent",
              }))
            : portfolio,
          history: Array.isArray(data.history) ? data.history : [],
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setPortfolioData((current) => current);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const portfolioCards = useMemo(
    () => (portfolioData.metrics.length ? portfolioData.metrics : portfolio),
    [portfolioData.metrics],
  );

  return (
    <>
      <section className="relative mx-auto max-w-7xl px-6 py-28 text-center lg:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Умные инвестиции
            </span>
            <br />
            <span className="text-white/90">будущего</span>
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-300">
            Используй AI и современные технологии для увеличения капитала.
            Простой интерфейс, мощная аналитика и автоматизация.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
            <button
              type="button"
              onClick={() => onNavigate("pricing")}
              className="relative rounded-xl bg-gradient-to-r from-blue-500 to-green-400 px-10 py-4 text-lg font-semibold shadow-xl transition hover:scale-105"
            >
              <span className="relative z-10">Начать инвестировать</span>
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-green-400 opacity-40 blur" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("platform")}
              className="rounded-xl border border-white/20 px-10 py-4 text-lg font-semibold backdrop-blur transition hover:bg-white/10"
            >
              Смотреть демо
            </button>
          </div>

          <BackendStatus />
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.text}
              className="float-card rounded-xl bg-gradient-to-br from-white/10 to-transparent p-5 text-sm shadow-lg backdrop-blur"
            >
              <span className="mr-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                {item.icon}
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
          <h3 className="mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-3xl font-semibold text-transparent">
            Ваш портфель
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            {portfolioCards.map((card) => (
              <div
                key={card.id ?? card.label}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br p-6 ${card.classes}`}
              >
                <p className="text-sm text-gray-400">{card.label}</p>
                <h4 className="text-3xl font-bold">{card.value}</h4>
              </div>
            ))}
          </div>

          <PortfolioChart points={portfolioData.history} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-24 md:grid-cols-2 xl:grid-cols-4 lg:px-10">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:scale-105"
          >
            <h4 className="mb-2 font-semibold">{feature.title}</h4>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </article>
        ))}
      </section>
    </>
  );
}
