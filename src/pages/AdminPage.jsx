import { useEffect, useState } from "react";
import {
  clearAdminToken,
  getAdminLeads,
  getAdminSubscriptions,
  getAdminToken,
  getAdminUsers,
  getPlans,
  loginAdmin,
  setAdminToken,
  updateAdminPlan,
} from "../api";
import { formatCurrency } from "../utils/formatters";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [plans, setPlans] = useState([]);
  const [leads, setLeads] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(getAdminToken());

  async function loadAdminData() {
    if (!getAdminToken()) return;

    const [plansData, leadsData, subscriptionsData, usersData] = await Promise.all([
      getPlans(),
      getAdminLeads(),
      getAdminSubscriptions(),
      getAdminUsers(),
    ]);

    setPlans(plansData);
    setLeads(leadsData);
    setSubscriptions(subscriptionsData);
    setUsers(usersData);
  }

  useEffect(() => {
    loadAdminData().catch(() => {
      clearAdminToken();
    });
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await loginAdmin(password);
      setAdminToken(result.token);
      setPassword("");
      await loadAdminData();
      setMessage("Админ-панель открыта.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function updatePlanField(planId, field, value) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              [field]: field === "averageRate" ? Number(value) : value,
            }
          : plan,
      ),
    );
  }

  async function savePlan(plan) {
    setMessage("");

    try {
      const updated = await updateAdminPlan(plan.id, plan);
      setPlans((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage("Тариф сохранен.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    clearAdminToken();
    setPlans([]);
    setLeads([]);
    setSubscriptions([]);
    setUsers([]);
    setMessage("Вы вышли из админки.");
  }

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-lg px-6 py-20">
        <p className="text-sm uppercase tracking-[0.25em] text-pink-200">Admin</p>
        <h2 className="mt-3 text-4xl font-extrabold">Вход в админ-панель</h2>
        <form
          onSubmit={handleLogin}
          className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6"
        >
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-pink-300/50"
            placeholder="Admin password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-400 to-cyan-400 py-4 font-bold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-amber-100">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-pink-200">Admin</p>
          <h2 className="mt-3 text-4xl font-extrabold">Панель управления</h2>
          <p className="mt-3 text-slate-300">Заявки, пользователи, подписки и тарифы.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => loadAdminData().catch((error) => setMessage(error.message))}
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Обновить
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Выйти
          </button>
        </div>
      </div>

      {message ? <p className="mt-5 text-sm text-emerald-100">{message}</p> : null}

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Заявки</p>
          <p className="mt-2 text-3xl font-bold">{leads.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Подписки</p>
          <p className="mt-2 text-3xl font-bold">{subscriptions.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Пользователи</p>
          <p className="mt-2 text-3xl font-bold">{users.length}</p>
        </div>
      </div>

      <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h3 className="text-2xl font-bold">Тарифы</h3>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{plan.id}</p>
              <input
                value={plan.title}
                onChange={(event) => updatePlanField(plan.id, "title", event.target.value)}
                className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-cyan-300/50"
              />
              <input
                type="number"
                min="0"
                max="1"
                step="0.001"
                value={plan.averageRate}
                onChange={(event) => updatePlanField(plan.id, "averageRate", event.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-cyan-300/50"
              />
              <input
                value={plan.risk}
                onChange={(event) => updatePlanField(plan.id, "risk", event.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-cyan-300/50"
              />
              <button
                type="button"
                onClick={() => savePlan(plan)}
                className="mt-4 w-full rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950"
              >
                Сохранить
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold">Заявки</h3>
          <div className="mt-5 space-y-4">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm text-cyan-200">{lead.email}</p>
                  </div>
                  <p className="text-sm text-slate-400">{lead.planId}</p>
                </div>
                {lead.message ? <p className="mt-3 text-sm text-slate-300">{lead.message}</p> : null}
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold">Подписки</h3>
          <div className="mt-5 space-y-4">
            {subscriptions.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div>
                    <p className="font-semibold">{item.planId}</p>
                    <p className="text-sm text-slate-400">{item.userEmail || "guest"}</p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(item.investmentAmount)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
