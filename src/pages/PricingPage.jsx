import { useEffect, useMemo, useState } from "react";
import { createSubscription, getPlans } from "../api";
import { faqItems, plans } from "../siteData";
import { formatCurrency } from "../utils/formatters";

export default function PricingPage({ selectedPlanId, onPlanSelect }) {
  const [amount, setAmount] = useState("10000");
  const [apiPlans, setApiPlans] = useState([]);
  const [savingPlanId, setSavingPlanId] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getPlans()
      .then((items) => {
        if (!isMounted) return;
        setApiPlans(items);
      })
      .catch(() => {
        if (!isMounted) return;
        setApiPlans([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visiblePlans = useMemo(
    () =>
      plans.map((plan) => {
        const apiPlan = apiPlans.find((item) => item.id === plan.id);

        if (!apiPlan) {
          return plan;
        }

        return {
          ...plan,
          title: apiPlan.title,
          averageRate: Number(apiPlan.averageRate),
          risk: apiPlan.risk,
          profit: `${Math.round(Number(apiPlan.averageRate) * 100)}%`,
        };
      }),
    [apiPlans],
  );

  const selectedPlan =
    visiblePlans.find((plan) => plan.id === selectedPlanId) ?? visiblePlans[1];

  const numericAmount = Number(amount) || 0;
  const annualProfit = numericAmount * selectedPlan.averageRate;
  const finalBalance = numericAmount + annualProfit;
  const monthlyProfit = annualProfit / 12;
  const rateLabel = Math.round(selectedPlan.averageRate * 100);

  async function handlePlanSelect(planId) {
    onPlanSelect(planId);
    setSavingPlanId(planId);
    setSelectionMessage("");

    try {
      await createSubscription({
        planId,
        investmentAmount: numericAmount,
      });
      setSelectionMessage("Тариф сохранён в базе.");
    } catch (error) {
      setSelectionMessage(error.message);
    } finally {
      setSavingPlanId("");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="text-center">
        <h2 className="bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-300 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
          Тарифные планы
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Выбери стратегию под свой риск и доход, а затем посмотри прогноз по
          сумме прямо в калькуляторе.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {visiblePlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <article
              key={plan.id}
              className={`rounded-3xl border p-8 transition duration-300 ${
                plan.featured ? "scale-[1.03] shadow-2xl" : "shadow-xl"
              } ${
                isSelected
                  ? "border-cyan-300/60 bg-white/10"
                  : "border-white/10 bg-gradient-to-br"
              } ${plan.cardClass}`}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                {plan.featured ? (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                    Популярный
                  </span>
                ) : null}
              </div>

              <p className="mb-4 text-3xl font-bold text-white">{plan.profit}</p>

              <ul className="mb-6 space-y-2 text-sm text-slate-300">
                <li>✔ {plan.risk}</li>
                {plan.features.map((feature) => (
                  <li key={feature}>✔ {feature}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanSelect(plan.id)}
                disabled={savingPlanId === plan.id}
                className={`w-full rounded-xl py-3 font-semibold transition ${plan.buttonClass} ${
                  isSelected ? "ring-2 ring-cyan-300/50" : ""
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {savingPlanId === plan.id
                  ? "Сохранение..."
                  : isSelected
                    ? "Выбрано"
                    : "Выбрать"}
              </button>
            </article>
          );
        })}
      </div>

      {selectionMessage ? (
        <p className="mx-auto mt-6 max-w-xl rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-3 text-center text-sm text-emerald-100">
          {selectionMessage}
        </p>
      ) : null}

      <div className="mt-20 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur xl:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/10 text-slate-100">
              <tr>
                <th className="rounded-l-2xl p-4">Функции</th>
                <th className="p-4">Старт</th>
                <th className="p-4">Баланс</th>
                <th className="rounded-r-2xl p-4">Про</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-t border-white/10">
                <td className="p-4">AI аналитика</td>
                <td className="p-4">—</td>
                <td className="p-4">✔</td>
                <td className="p-4">✔</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="p-4">Автоинвест</td>
                <td className="p-4">✔</td>
                <td className="p-4">✔</td>
                <td className="p-4">✔</td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="p-4">Поддержка</td>
                <td className="p-4">Базовая</td>
                <td className="p-4">Средняя</td>
                <td className="p-4">Премиум</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-bold">Калькулятор доходности</h3>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Тариф: {selectedPlan.title}
            </span>
          </div>

          <label className="mb-3 block text-sm font-medium text-slate-300">
            Сумма инвестиций ($)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-lg text-white outline-none transition focus:border-cyan-300/50 focus:bg-black/40"
            placeholder="Введите сумму"
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Ставка
              </p>
              <p className="mt-2 text-2xl font-bold text-cyan-200">
                {rateLabel}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                В месяц
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-200">
                {formatCurrency(monthlyProfit)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                За год
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-200">
                {formatCurrency(annualProfit)}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20"
          >
            Рассчитано для тарифа {selectedPlan.title}
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-900/40 to-emerald-500/10 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <h3 className="text-2xl font-bold">Прогноз результата</h3>
          <p className="mt-3 text-slate-300">
            На основе выбранного тарифа и суммы инвестиций калькулятор показывает
            ориентировочный итог за 12 месяцев.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Стартовый капитал</p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(numericAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Ожидаемая прибыль</p>
              <p className="mt-2 text-3xl font-bold text-emerald-300">
                {formatCurrency(annualProfit)}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-5">
              <p className="text-sm text-cyan-100/80">Итоговый баланс</p>
              <p className="mt-2 text-4xl font-extrabold text-white">
                {formatCurrency(finalBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 max-w-3xl">
        <h3 className="text-2xl font-bold">FAQ</h3>
        <div className="mt-6 grid gap-4">
          {faqItems.map((item) => (
            <article
              key={item.question}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h4 className="text-lg font-semibold">{item.question}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
