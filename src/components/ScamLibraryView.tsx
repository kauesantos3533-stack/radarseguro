import React, { useState } from "react";
import {
  BookOpen,
  Search,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Sparkles,
} from "lucide-react";
import { SCAM_DATABASE } from "../data/scamDatabase";
import { ScamInfo } from "../types";

interface ScamLibraryViewProps {
  onSelectScamForAnalysis?: (scam: ScamInfo) => void;
}

export const ScamLibraryView: React.FC<ScamLibraryViewProps> = ({ onSelectScamForAnalysis }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedScamId, setExpandedScamId] = useState<string | null>("falsa-central");

  const categories = [
    { id: "all", label: "Todos os Golpes" },
    { id: "bank", label: "Bancários & 0800" },
    { id: "pix", label: "Pix & Pagamentos" },
    { id: "whatsapp", label: "WhatsApp & Redes" },
    { id: "shopping", label: "Correios & Compras" },
    { id: "jobs", label: "Falso Emprego / Tarefas" },
  ];

  const filteredScams = SCAM_DATABASE.filter((scam) => {
    const matchesCategory = selectedCategory === "all" || scam.category === selectedCategory;
    const matchesSearch =
      scam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scam.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scam.realExample.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <BookOpen className="w-3.5 h-3.5" /> Enciclopédia Antifraude
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
            Guia de Golpes Mais Comuns no Brasil
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
            Conheça as táticas de engenharia social mais utilizadas por criminosos digitais e saiba exatamente como não cair.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar golpe ou palavra..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Scams Grid */}
      <div className="space-y-4">
        {filteredScams.map((scam) => {
          const isExpanded = expandedScamId === scam.id;
          return (
            <div
              key={scam.id}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              {/* Header card */}
              <div
                onClick={() => setExpandedScamId(isExpanded ? null : scam.id)}
                className="flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Severidade Alta
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {scam.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {scam.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {scam.summary}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-5 animate-fade-in">
                  {/* Real Example */}
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Exemplo Real de Mensagem do Golpe
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{scam.realExample}"
                    </p>
                  </div>

                  {/* How it works & Red flags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" /> Como os Golpistas Agem
                      </h4>
                      <ul className="space-y-1.5">
                        {scam.howItWorks.map((step, i) => (
                          <li key={i} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                            <span className="font-bold text-amber-600">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-900 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-600" /> Sinais Claros de Alerta
                      </h4>
                      <ul className="space-y-1.5">
                        {scam.redFlags.map((flag, i) => (
                          <li key={i} className="text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2">
                            <span className="font-bold text-rose-600">•</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Prevention */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Como se Proteger
                    </h4>
                    <ul className="space-y-1.5">
                      {scam.prevention.map((prev, i) => (
                        <li key={i} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2 font-medium">
                          <span className="font-bold text-emerald-600">✓</span>
                          <span>{prev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredScams.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhum golpe encontrado para o termo pesquisado.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tente buscar por termos como "Pix", "Correios", "WhatsApp" ou "Banco".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
