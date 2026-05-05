import { useEffect, useState } from "react";
import { getHealth } from "../api";

export default function BackendStatus() {
  const [state, setState] = useState({
    loading: true,
    status: "checking",
    message: "Checking API",
  });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (!isMounted) return;
        setState({
          loading: false,
          status: data.database,
          message: `API: ${data.status}. DB: ${data.database}.`,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setState({
          loading: false,
          status: "offline",
          message: error.message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isOnline = state.status === "connected";

  return (
    <div
      className={`mx-auto mt-10 max-w-xl rounded-2xl border px-5 py-4 text-sm shadow-xl backdrop-blur ${
        isOnline
          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
          : "border-amber-300/30 bg-amber-400/10 text-amber-100"
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isOnline ? "bg-emerald-300" : "bg-amber-300"
          } ${state.loading ? "animate-pulse" : ""}`}
        />
        <span>{state.message}</span>
      </div>
    </div>
  );
}
