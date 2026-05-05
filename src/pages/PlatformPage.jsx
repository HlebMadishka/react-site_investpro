import {
  automationSteps,
  integrations,
  platformCards,
} from "../siteData";

export default function PlatformPage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
            Платформа нового поколения
          </p>
          <h2 className="text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Управляй капиталом
            </span>
            <br />
            <span className="text-white">в одном умном интерфейсе</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            InvestPro объединяет аналитику, автоматизацию, уведомления и риск-
            менеджмент в единую платформу. Здесь можно не только смотреть
            графики, но и принимать решения быстрее и спокойнее.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate("pricing")}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-8 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-1"
            >
              Выбрать стратегию
            </button>
            <button
              type="button"
              onClick={() => onNavigate("contacts")}
              className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-semibold backdrop-blur transition hover:bg-white/10"
            >
              Запросить презентацию
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live AI Console</p>
                <h3 className="mt-2 text-2xl font-bold">Growth Engine</h3>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                online
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Сигналы
                </p>
                <p className="mt-2 text-3xl font-bold text-cyan-200">14</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Точность
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-200">92%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <p className="text-sm text-slate-400">AI рекомендует</p>
                <p className="mt-2 text-lg font-semibold">
                  Усилить долю защитных активов и удерживать ликвидность 18%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {platformCards.map((card) => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur"
          >
            <h3 className="text-2xl font-bold">{card.title}</h3>
            <p className="mt-4 leading-7 text-slate-300">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h3 className="text-3xl font-bold">Как работает платформа</h3>
          <div className="mt-8 space-y-5">
            {automationSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
              >
                <p className="text-sm font-semibold tracking-[0.3em] text-cyan-200">
                  {item.step}
                </p>
                <h4 className="mt-2 text-xl font-semibold">{item.title}</h4>
                <p className="mt-3 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/10 via-slate-900/40 to-cyan-500/10 p-8 shadow-2xl backdrop-blur">
          <h3 className="text-3xl font-bold">Экосистема и опции</h3>
          <p className="mt-4 max-w-2xl text-slate-300">
            Добавил сюда полезные возможности, чтобы сайт выглядел сильнее и
            богаче: интеграции, экспорт отчётов, телеграм-бот и подготовка white-
            label сценариев для команд.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {integrations.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-6">
            <p className="text-sm text-cyan-100/80">Дополнительная опция</p>
            <h4 className="mt-2 text-2xl font-bold">Командный режим</h4>
            <p className="mt-3 text-slate-200">
              Руководители могут отслеживать несколько портфелей и назначать
              разные роли аналитикам и клиентским менеджерам.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
