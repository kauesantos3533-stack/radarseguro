import React from "react";
import { Shield, AlertOctagon, BookOpen, HelpCircle, History, Sparkles, Zap, MapPin, Bot, Code } from "lucide-react";
import { NotificationPermissionBanner } from "./NotificationPermissionBanner";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, historyCount }) => {
  const tabs = [
    { id: "analyze", label: "Verificador", icon: Shield, highlight: false },
    { id: "assistant", label: "Assistente IA", icon: Bot, highlight: false },
    { id: "map", label: "Mapa de Golpes", icon: MapPin, highlight: false },
    { id: "victim", label: "Fui Vítima", icon: AlertOctagon, highlight: true },
    { id: "takedown", label: "Derrubar Golpe", icon: Zap, highlight: false },
    { id: "api_docs", label: "APIs & Devs", icon: Code, highlight: false },
    { id: "library", label: "Guia de Golpes", icon: BookOpen, highlight: false },
    { id: "quiz", label: "Simulador", icon: HelpCircle, highlight: false },
    { id: "history", label: "Histórico", icon: History, badge: historyCount, highlight: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => setActiveTab("analyze")}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
            id="brand-logo-button"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Radar<span className="text-blue-600 dark:text-blue-400">Seguro</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-2.5 h-2.5" /> Antifraude
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block font-medium">
                Antes de confiar, consulte.
              </p>
            </div>
          </button>


          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NotificationPermissionBanner />
          </div>

          <nav className="hidden md:flex items-center gap-1.5" aria-label="Navegação Principal">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? tab.highlight
                        ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-800"
                        : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800"
                      : tab.highlight
                      ? "text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                      {tab.badge}
                    </span>
                  )}
                  {tab.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick SOS button for mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setActiveTab("victim")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "victim"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SOS Golpe</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? tab.highlight
                      ? "bg-red-600 text-white font-bold"
                      : "bg-blue-600 text-white font-bold"
                    : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-white/20">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
