import { useState } from "react";
import Header from "./components/Header";
import "./App.css";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import ContactsPage from "./pages/ContactsPage";
import HomePage from "./pages/HomePage";
import PlatformPage from "./pages/PlatformPage";
import PricingPage from "./pages/PricingPage";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedPlanId, setSelectedPlanId] = useState("balance");

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white font-brand">
      <div className="glow-orb absolute left-0 top-0 h-96 w-96 rounded-full bg-green-400 opacity-20 blur-3xl" />
      <div className="glow-orb glow-orb-delay absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-500 opacity-20 blur-3xl" />

      <div className="relative z-10">
        <Header activePage={activePage} onNavigate={setActivePage} />
        {activePage === "home" ? <HomePage onNavigate={setActivePage} /> : null}
        {activePage === "platform" ? (
          <PlatformPage onNavigate={setActivePage} />
        ) : null}
        {activePage === "pricing" ? (
          <PricingPage
            selectedPlanId={selectedPlanId}
            onPlanSelect={setSelectedPlanId}
          />
        ) : null}
        {activePage === "contacts" ? (
          <ContactsPage onNavigate={setActivePage} />
        ) : null}
        {activePage === "account" ? <AccountPage /> : null}
        {activePage === "admin" ? <AdminPage /> : null}
      </div>
    </main>
  );
}
