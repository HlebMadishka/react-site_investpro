import { useEffect, useState } from "react";
import {
  clearUserToken,
  getAccount,
  getUserToken,
  loginUser,
  registerUser,
  setUserToken,
} from "../api";
import { formatCurrency } from "../utils/formatters";

const emptyForm = {
  name: "",
  email: "",
  password: "",
};

export default function AccountPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadAccount() {
    if (!getUserToken()) return;

    try {
      setAccount(await getAccount());
    } catch {
      clearUserToken();
      setAccount(null);
    }
  }

  useEffect(() => {
    loadAccount();
  }, []);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = mode === "login" ? await loginUser(form) : await registerUser(form);
      setUserToken(result.token);
      setForm(emptyForm);
      await loadAccount();
      setMessage("Готово. Кабинет подключен.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearUserToken();
    setAccount(null);
    setMessage("Вы вышли из кабинета.");
  }

  if (account) {
    const total = account.investments.reduce((sum, item) => sum + item.amount, 0);

    return (
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Личный кабинет</p>
            <h2 className="mt-3 text-4xl font-extrabold">Привет, {account.user.name}</h2>
            <p className="mt-3 text-slate-300">{account.user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Выйти
          </button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Инвестировано</p>
            <p className="mt-2 text-3xl font-bold text-emerald-200">{formatCurrency(total)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Активных записей</p>
            <p className="mt-2 text-3xl font-bold text-cyan-200">{account.investments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Статус</p>
            <p className="mt-2 text-3xl font-bold text-violet-200">Active</p>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold">Мои инвестиции</h3>
          <div className="mt-6 grid gap-4">
            {account.investments.length ? (
              account.investments.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-xl font-semibold">{item.planTitle}</h4>
                      <p className="text-sm text-slate-400">{item.risk}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold">{formatCurrency(item.amount)}</p>
                      <p className="text-sm text-emerald-200">
                        {Math.round(item.averageRate * 100)}% годовых
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-slate-300">
                Выберите тариф и сумму на странице тарифов, чтобы запись появилась здесь.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-6 py-20">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-200">Аккаунт</p>
      <h2 className="mt-3 text-4xl font-extrabold">
        {mode === "login" ? "Вход в кабинет" : "Регистрация"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6"
      >
        {mode === "register" ? (
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300/50"
            placeholder="Имя"
            required
          />
        ) : null}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300/50"
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-cyan-300/50"
          placeholder="Пароль, минимум 8 символов"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 py-4 font-bold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Проверка..." : mode === "login" ? "Войти" : "Создать аккаунт"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-5 text-cyan-200 hover:text-cyan-100"
      >
        {mode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
      </button>

      {message ? <p className="mt-4 text-sm text-amber-100">{message}</p> : null}
    </section>
  );
}
