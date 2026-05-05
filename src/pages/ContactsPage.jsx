import { contactWays, offices } from "../siteData";
import LeadForm from "../components/LeadForm";

export default function ContactsPage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-pink-300/20 bg-pink-400/10 px-4 py-2 text-sm font-medium text-pink-200">
            Контакты и сопровождение
          </p>
          <h2 className="text-5xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-pink-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Свяжись с командой
            </span>
            <br />
            <span className="text-white">и получи персональный план</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Если нужен показ платформы, помощь с тарифом или корпоративное
            решение, мы соберем сценарий под твои цели и подключимся в удобном формате.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate("pricing")}
              className="rounded-2xl bg-gradient-to-r from-pink-400 to-cyan-400 px-8 py-4 font-bold text-slate-950 shadow-xl shadow-pink-500/20 transition hover:-translate-y-1"
            >
              Выбрать тариф
            </button>
            <button
              type="button"
              onClick={() => onNavigate("platform")}
              className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-semibold backdrop-blur transition hover:bg-white/10"
            >
              Изучить платформу
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h3 className="text-3xl font-bold">Каналы связи</h3>
          <div className="mt-8 space-y-4">
            {contactWays.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
              >
                <p className="text-sm text-slate-400">{item.title}</p>
                <h4 className="mt-2 text-xl font-semibold">{item.value}</h4>
                <p className="mt-3 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
          <LeadForm />
        </div>
      </div>

      <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900/40 to-pink-500/10 p-8 shadow-2xl backdrop-blur">
          <h3 className="text-3xl font-bold">Что еще можно запросить</h3>
          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-xl font-semibold">Персональный разбор портфеля</h4>
              <p className="mt-3 text-slate-300">
                Аналитик разберет текущую структуру активов и предложит план оптимизации.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-xl font-semibold">Demo для команды</h4>
              <p className="mt-3 text-slate-300">
                Проведем отдельную презентацию для партнеров, клиентов или отдела продаж.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-xl font-semibold">White-label решение</h4>
              <p className="mt-3 text-slate-300">
                Подготовим брендированную версию платформы для инвестиционных команд.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h3 className="text-3xl font-bold">Глобальное присутствие</h3>
          <p className="mt-4 text-slate-300">
            Для надежности и скорости поддержки команда распределена между
            несколькими точками и удаленным сервисом.
          </p>

          <div className="mt-8 space-y-4">
            {offices.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-4 font-medium text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-6">
            <p className="text-sm text-emerald-100/80">Время ответа</p>
            <h4 className="mt-2 text-3xl font-bold">до 15 минут</h4>
            <p className="mt-3 text-slate-200">
              Для клиентов с активным тарифом команда приоритизирует запросы и
              помогает быстрее принять решение.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
