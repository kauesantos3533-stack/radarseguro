import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { AnalyzerView } from "./components/AnalyzerView";
import { VictimGuideView } from "./components/VictimGuideView";
import { ScamLibraryView } from "./components/ScamLibraryView";
import { QuizSimulatorView } from "./components/QuizSimulatorView";
import { HistoryView } from "./components/HistoryView";
import { TakedownView } from "./components/TakedownView";
import { ScamRadarMapView } from "./components/ScamRadarMapView";
import { AiAssistantChatView } from "./components/AiAssistantChatView";
import { ApiDocsView } from "./components/ApiDocsView";
import { AnalysisResult } from "./types";
import { getHistory } from "./utils/storage";
import { Shield, AlertOctagon, Phone, Lock, HeartHandshake, Bot, MessageSquare, X, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("analyze");
  const [historyCount, setHistoryCount] = useState(0);
  const [victimInitialData, setVictimInitialData] = useState<Partial<AnalysisResult> | null>(null);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  const refreshHistoryCount = () => {
    const history = getHistory();
    setHistoryCount(history.length);
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  const handleGoToVictim = (data?: Partial<AnalysisResult>) => {
    if (data) {
      setVictimInitialData(data);
    }
    setActiveTab("victim");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScanCompleted = () => {
    refreshHistoryCount();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors relative">
      {/* Top emergency quick banner */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-[11px] font-medium border-b border-slate-800 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>RadarSeguro Ativo • Assistente IA 24h & Proteção contra Fraudes</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-400">
            <span>Bacen MED: Res. 103/21</span>
            <span>Disque Denúncia: 181</span>
            <span>Polícia Civil: 197 / 190</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        historyCount={historyCount}
      />

      {/* Main Workspace View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "analyze" && (
          <AnalyzerView
            onGoToVictim={handleGoToVictim}
            onScanComplete={handleScanCompleted}
            onGoToAssistant={(prompt) => {
              setActiveTab("assistant");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {activeTab === "assistant" && (
          <AiAssistantChatView
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {activeTab === "map" && (
          <ScamRadarMapView />
        )}

        {activeTab === "victim" && (
          <VictimGuideView initialData={victimInitialData} />
        )}

        {activeTab === "takedown" && (
          <TakedownView />
        )}

        {activeTab === "api_docs" && (
          <ApiDocsView />
        )}

        {activeTab === "library" && (
          <ScamLibraryView />
        )}

        {activeTab === "quiz" && (
          <QuizSimulatorView />
        )}

        {activeTab === "history" && (
          <HistoryView
            onGoToVictim={handleGoToVictim}
            onGoToAssistant={(prompt) => {
              setActiveTab("assistant");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onHistoryChange={refreshHistoryCount}
          />
        )}
      </main>

      {/* Floating AI Assistant Chat Launcher & Window (available on any page) */}
      {activeTab !== "assistant" && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
          {isFloatingChatOpen && (
            <div className="mb-3 w-[360px] sm:w-[420px] h-[540px] shadow-2xl rounded-2xl overflow-hidden border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
              <AiAssistantChatView
                isFloating={true}
                onCloseFloating={() => setIsFloatingChatOpen(false)}
                onNavigateTab={(tab) => {
                  setIsFloatingChatOpen(false);
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          <button
            onClick={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
            id="floating-ai-button"
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm cursor-pointer border border-blue-400/30"
          >
            <div className="relative">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full animate-pulse" />
            </div>
            <span>{isFloatingChatOpen ? "Fechar Atendimento" : "Atendimento IA 24h"}</span>
            <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-white/20 uppercase font-black tracking-wider hidden xs:inline-block">
              Auto
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 mt-12 transition-colors">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  RadarSeguro
                </div>
                <div className="text-xs text-slate-500">
                  Antes de confiar, consulte.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <button onClick={() => setActiveTab("analyze")} className="hover:text-blue-600 transition-colors">
                Verificador de Risco
              </button>
              <button onClick={() => setActiveTab("assistant")} className="hover:text-blue-600 text-blue-500 font-bold transition-colors">
                Assistente IA 24h
              </button>
              <button onClick={() => setActiveTab("map")} className="hover:text-blue-600 transition-colors">
                Mapa de Golpes
              </button>
              <button onClick={() => setActiveTab("victim")} className="hover:text-red-600 text-red-500 transition-colors">
                SOS Vítima (MED)
              </button>
              <button onClick={() => setActiveTab("takedown")} className="hover:text-amber-500 text-amber-600 transition-colors">
                Derrubar Golpe
              </button>
              <button onClick={() => setActiveTab("api_docs")} className="hover:text-blue-600 text-blue-500 font-bold transition-colors">
                APIs & Devs
              </button>
              <button onClick={() => setActiveTab("library")} className="hover:text-blue-600 transition-colors">
                Guia de Golpes
              </button>
              <button onClick={() => setActiveTab("quiz")} className="hover:text-blue-600 transition-colors">
                Simulador
              </button>
              <button onClick={() => setActiveTab("history")} className="hover:text-blue-600 transition-colors">
                Histórico
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Privacidade Garantida: Seus dados bancários e senhas nunca são salvos ou compartilhados.</span>
            </div>
            <div className="text-[11px] text-slate-400">
              RadarSeguro • Sistema Inteligente de Atendimento Automático
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
