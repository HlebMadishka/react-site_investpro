const navItems = [
  { id: "home", label: "Главная" },
  { id: "platform", label: "Платформа" },
  { id: "pricing", label: "Тарифы" },
  { id: "contacts", label: "Контакты" },
  { id: "account", label: "Кабинет" },
  { id: "admin", label: "Admin" },
];

export default function Header({ activePage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/45 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-400 bg-clip-text text-left text-xl font-extrabold tracking-[0.35em] text-transparent"
          >
            INVESTPRO
          </button>

          <nav className="hidden flex-wrap items-center gap-5 text-sm font-semibold text-slate-200 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`transition hover:text-cyan-300 ${
                  activePage === item.id ? "text-cyan-300" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <button
            type="button"
            onClick={() => onNavigate("pricing")}
            className="rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-2xl shadow-cyan-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-400/30"
          >
            Начать инвестировать
          </button>
          <button
            type="button"
            onClick={() => onNavigate("account")}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition duration-300 hover:border-cyan-300/40 hover:bg-white/10"
          >
            Мой кабинет
          </button>
        </div>
      </div>
    </header>
  );
}
