import { useState } from "react";
import { createLead } from "../api";

const initialForm = {
  name: "",
  email: "",
  planId: "balance",
  message: "",
};

export default function LeadForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      await createLead(form);
      setStatus("success");
      setMessage("Заявка сохранена в базе.");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          value={form.name}
          onChange={updateField}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
          placeholder="Имя"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
          placeholder="Email"
          required
        />
      </div>

      <select
        name="planId"
        value={form.planId}
        onChange={updateField}
        className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
      >
        <option value="start">Start</option>
        <option value="balance">Balance</option>
        <option value="pro">Pro</option>
      </select>

      <textarea
        name="message"
        value={form.message}
        onChange={updateField}
        className="mt-4 min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-cyan-300/50"
        placeholder="Комментарий"
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-400 to-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Отправка..." : "Отправить заявку"}
      </button>

      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "success" ? "text-emerald-200" : "text-amber-200"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
