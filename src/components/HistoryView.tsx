import React, { useState, useEffect, useRef } from "react";
import {
  History,
  Trash2,
  Search,
  AlertTriangle,
  Download,
  Upload,
  ExternalLink,
  Shield,
  Clock,
  ChevronRight,
  X,
  AlertOctagon,
  Copy,
  Check,
  Bot,
  Filter,
  ArrowUpDown,
  FileText,
  RotateCcw,
  Sparkles,
  CheckSquare,
  Square,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Share2,
} from "lucide-react";
import { AnalysisResult, RiskLevel } from "../types";
import {
  getHistory,
  fetchHistoryFromFirebase,
  deleteHistoryItem,
  deleteMultipleHistoryItems,
  clearHistory,
  restoreSampleHistory,
  importHistory,
  getUserStats,
} from "../utils/storage";
import { RiskMeter } from "./RiskMeter";

interface HistoryViewProps {
  onGoToVictim: (data: AnalysisResult) => void;
  onGoToAssistant?: (prompt?: string) => void;
  onReAnalyze?: (item: AnalysisResult) => void;
  onHistoryChange?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onGoToVictim,
  onGoToAssistant,
  onReAnalyze,
  onHistoryChange,
}) => {
  const [historyItems, setHistoryItems] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_risk" | "lowest_risk">("newest");
  const [selectedItem, setSelectedItem] = useState<AnalysisResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedModal, setCopiedModal] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Modal confirmation states
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const loadHistory = () => {
    const items = getHistory();
    setHistoryItems(items);
    if (onHistoryChange) onHistoryChange();
  };

  const handleSyncWithFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const remoteItems = await fetchHistoryFromFirebase();
      if (remoteItems && remoteItems.length > 0) {
        setHistoryItems(remoteItems);
        if (onHistoryChange) onHistoryChange();
        showNotification(`Sincronizado com Firebase! ${remoteItems.length} registros atualizados.`, "success");
      } else {
        // Push local items to Firebase
        const local = getHistory();
        if (local.length > 0) {
          restoreSampleHistory();
          showNotification("Dados locais sincronizados com o banco de dados Firebase!", "success");
        } else {
          showNotification("Nenhum dado remoto novo no Firebase.", "info");
        }
      }
    } catch (e) {
      showNotification("Erro na sincronização com Firebase.", "warning");
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Auto sync on mount in background
    fetchHistoryFromFirebase().then((res) => {
      if (res && res.length > 0) {
        setHistoryItems(res);
        if (onHistoryChange) onHistoryChange();
      }
    });
  }, []);

  const stats = getUserStats();

  // Handle single item deletion
  const executeDeleteItem = (id: string) => {
    deleteHistoryItem(id);
    loadHistory();
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    setItemToDelete(null);
    showNotification("Verificação excluída com sucesso.");
  };

  // Handle batch deletion
  const executeDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    deleteMultipleHistoryItems(selectedIds);
    loadHistory();
    if (selectedItem && selectedIds.includes(selectedItem.id || "")) {
      setSelectedItem(null);
    }
    setSelectedIds([]);
    setConfirmDeleteSelectedOpen(false);
    showNotification(`${selectedIds.length} análises removidas com sucesso.`);
  };

  // Handle clear all
  const executeClearAll = () => {
    clearHistory();
    loadHistory();
    setSelectedIds([]);
    setSelectedItem(null);
    setConfirmClearAllOpen(false);
    showNotification("Histórico completo apagado.", "info");
  };

  // Handle restore samples
  const handleRestoreSamples = () => {
    restoreSampleHistory();
    loadHistory();
    showNotification("Exemplos de análises educativas carregados!", "success");
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataToExport = selectedIds.length > 0
      ? historyItems.filter((i) => selectedIds.includes(i.id || ""))
      : historyItems;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `RadarSeguro_Historico_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification(`Arquivo JSON exportado (${dataToExport.length} itens).`);
  };

  // Handle File Upload Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const res = importHistory(parsed);
          loadHistory();
          showNotification(`${res.added} novos itens importados com sucesso!`);
        } else {
          showNotification("Formato de arquivo inválido. Deve ser um array de análises JSON.", "warning");
        }
      } catch {
        showNotification("Erro ao ler arquivo JSON.", "warning");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Toggle selection
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select all or none
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id || "").filter(Boolean));
    }
  };

  // Copy item content
  const handleCopyItem = (item: AnalysisResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `[RadarSeguro] ${item.title}\nRisco: ${item.risk.toUpperCase()} (${item.riskScore}%)\nResumo: ${item.summary}\nConteúdo: ${item.inputContent}`;
    navigator.clipboard.writeText(text);
    setCopiedItemId(item.id || "");
    setTimeout(() => setCopiedItemId(null), 2000);
  };

  // Copy modal text
  const handleCopyModalReport = () => {
    if (!selectedItem) return;
    const report = `[Relatório Antifraude - RadarSeguro]
Data da Análise: ${selectedItem.timestamp ? new Date(selectedItem.timestamp).toLocaleString("pt-BR") : "N/A"}
Diagnóstico: ${selectedItem.title}
Grau de Risco: ${selectedItem.risk.toUpperCase()} (Score: ${selectedItem.riskScore}/100)
Modalidade: ${selectedItem.scamCategory}
Resumo Técnico: ${selectedItem.summary}

Conteúdo Analisado:
"${selectedItem.inputContent}"

Sinais de Alerta Identificados:
${selectedItem.redFlags?.map((f) => `- ${f}`).join("\n") || "Nenhum sinal crítico"}

Orientações Oficiais:
${selectedItem.recommendations?.map((r) => `- ${r}`).join("\n") || "Mantenha a cautela"}`;

    navigator.clipboard.writeText(report);
    setCopiedModal(true);
    setTimeout(() => setCopiedModal(false), 2000);
    showNotification("Relatório copiado para a área de transferência.");
  };

  // Filter and Sort Logic
  const filteredItems = historyItems
    .filter((item) => {
      const matchesRisk = filterRisk === "all" || item.risk === filterRisk;
      const matchesCategory =
        filterCategory === "all" ||
        item.scamCategory.toLowerCase().includes(filterCategory.toLowerCase()) ||
        item.type === filterCategory;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        item.inputContent.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.scamCategory.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);

      return matchesRisk && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (b.timestamp || 0) - (a.timestamp || 0);
      }
      if (sortBy === "oldest") {
        return (a.timestamp || 0) - (b.timestamp || 0);
      }
      if (sortBy === "highest_risk") {
        return (b.riskScore || 0) - (a.riskScore || 0);
      }
      if (sortBy === "lowest_risk") {
        return (a.riskScore || 0) - (b.riskScore || 0);
      }
      return 0;
    });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case "critical":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Crítico
          </span>
        );
      case "high":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Alto Risco
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-900 shadow-sm flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Atenção
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Seguro
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold text-white transition-all animate-in slide-in-from-top-3 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-600 border-emerald-400"
              : notification.type === "warning"
              ? "bg-amber-600 border-amber-400"
              : "bg-blue-600 border-blue-400"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <History className="w-3.5 h-3.5" /> Central de Histórico & Auditoria
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Histórico de Verificações
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consulte todas as mensagens, boletos, chaves Pix e links já analisados no seu dispositivo. Exporte relatórios para boletins de ocorrência ou consulte nosso Assistente IA 24h.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncWithFirebase}
              disabled={isSyncingFirebase}
              title="Sincronizar com banco de dados Firebase (Firestore)"
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${isSyncingFirebase ? "animate-spin" : ""}`} />
              <span>{isSyncingFirebase ? "Sincronizando..." : "Sincronizar Nuvem"}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Importar arquivo de histórico JSON"
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Importar JSON</span>
            </button>

            {historyItems.length > 0 ? (
              <>
                <button
                  onClick={handleExportJSON}
                  title="Exportar dados salvos"
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Exportar {selectedIds.length > 0 ? `(${selectedIds.length})` : "JSON"}
                  </span>
                </button>

                <button
                  onClick={() => setConfirmClearAllOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Limpar Tudo</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleRestoreSamples}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Carregar Análises de Exemplo</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total de Análises</div>
              <div className="text-2xl font-black text-white mt-1">{stats.totalScans || historyItems.length}</div>
            </div>
            <History className="w-6 h-6 text-slate-400/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-rose-300 font-semibold uppercase tracking-wider">Ameaças Evitadas</div>
              <div className="text-2xl font-black text-rose-400 mt-1">{stats.threatsDetected}</div>
            </div>
            <ShieldAlert className="w-6 h-6 text-rose-400/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">Consultas Seguras</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.safeScans}</div>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400/50" />
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">Simulador Antifraude</div>
              <div className="text-2xl font-black text-blue-300 mt-1">
                {stats.quizCompleted ? `${stats.quizScore}%` : "Não iniciado"}
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-blue-400/50" />
          </div>
        </div>
      </div>

      {/* Filter, Search & Bulk Actions Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Risk Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Risco:
            </span>
            {[
              { id: "all", label: "Todos" },
              { id: "critical", label: "Crítico" },
              { id: "high", label: "Alto Risco" },
              { id: "medium", label: "Atenção" },
              { id: "low", label: "Seguro" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterRisk(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterRisk === f.id
                    ? "bg-blue-600 text-white shadow-sm scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">📅 Mais recentes primeiro</option>
                <option value="oldest">📅 Mais antigos primeiro</option>
                <option value="highest_risk">⚠️ Maior risco primeiro</option>
                <option value="lowest_risk">🛡️ Menor risco primeiro</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por texto, chave ou categoria..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Batch Selection Banner */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-bold hover:text-blue-600 transition-colors cursor-pointer"
              >
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedIds.length === filteredItems.length && filteredItems.length > 0
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </span>
              </button>

              <span>
                Mostrando <strong className="text-slate-800 dark:text-slate-200">{filteredItems.length}</strong> de {historyItems.length} registros
              </span>
            </div>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600">
                  {selectedIds.length} selecionado(s)
                </span>
                <button
                  onClick={() => setConfirmDeleteSelectedOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 font-bold hover:bg-rose-100 text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir Selecionados</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Items Grid / List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id || "");
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-lg ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                {/* Left checkbox & Item Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleToggleSelect(item.id || "", e)}
                    className="mt-1 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getRiskBadge(item.risk)}
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recente"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.scamCategory}
                      </span>
                      {item.analyzedWithAi && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> IA
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 truncate">
                      "{item.inputContent}"
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Right side Score & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={`text-lg font-black ${
                          item.risk === "critical" || item.risk === "high"
                            ? "text-rose-600 dark:text-rose-400"
                            : item.risk === "medium"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {item.riskScore}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Score de Risco</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Copy Quick Button */}
                    <button
                      onClick={(e) => handleCopyItem(item, e)}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copiar resumo"
                    >
                      {copiedItemId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Item */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Excluir verificação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-2 text-slate-400 group-hover:text-blue-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 sm:p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800 shadow-inner">
            <History className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Nenhuma análise encontrada no histórico
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm || filterRisk !== "all"
                ? "Nenhum resultado corresponde aos filtros selecionados. Tente limpar os filtros de busca."
                : "Seu histórico está vazio. Faça uma análise na aba 'Verificador' ou carregue os exemplos educativos para explorar."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchTerm || filterRisk !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRisk("all");
                  setFilterCategory("all");
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Limpar Filtros
              </button>
            ) : (
              <button
                onClick={handleRestoreSamples}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Carregar Exemplos Educativos</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 border border-slate-200 dark:border-slate-800 animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getRiskBadge(selectedItem.risk)}
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedItem.timestamp ? new Date(selectedItem.timestamp).toLocaleString("pt-BR") : ""}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
                    {selectedItem.scamCategory}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Gauge */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <RiskMeter score={selectedItem.riskScore} risk={selectedItem.risk} size="md" />
            </div>

            {/* Content Analyzed */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Conteúdo Verificado:</span>
                <span className="uppercase text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                  {selectedItem.type}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                {selectedItem.inputContent}
              </div>
            </div>

            {/* Diagnostic Summary */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1.5">
              <strong className="text-blue-900 dark:text-blue-200 font-black block flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" /> Diagnóstico da Perícia Antifraude:
              </strong>
              <p>{selectedItem.summary}</p>
              {selectedItem.explanation && (
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/40">
                  {selectedItem.explanation}
                </p>
              )}
            </div>

            {/* Red Flags Alert */}
            {selectedItem.redFlags && selectedItem.redFlags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-black text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Sinais de Alerta Identificados ({selectedItem.redFlags.length}):
                </h4>
                <div className="space-y-1.5">
                  {selectedItem.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2"
                    >
                      <span className="font-black text-rose-500">•</span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedItem.recommendations && selectedItem.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Recomendações de Ação Imediata:
                </h4>
                <div className="space-y-1.5">
                  {selectedItem.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2"
                    >
                      <span className="font-bold text-emerald-600">✓</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleCopyModalReport}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedModal ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedModal ? "Copiado!" : "Copiar Relatório Completo"}</span>
              </button>

              <div className="flex items-center gap-2">
                {onGoToAssistant && (
                  <button
                    onClick={() => {
                      const item = selectedItem;
                      setSelectedItem(null);
                      onGoToAssistant(`Analisei este golpe: "${item.title}". O que mais você me recomenda fazer para me proteger?`);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Tirar Dúvida com IA</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    onGoToVictim(item);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Gerar Dossiê Policial (MED)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - DELETE SINGLE ITEM */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Excluir esta análise?
              </h3>
              <p className="text-xs text-slate-500">
                Você está prestes a remover o registro de "{itemToDelete.title}". Esta ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => executeDeleteItem(itemToDelete.id || "")}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - DELETE SELECTED */}
      {confirmDeleteSelectedOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Excluir {selectedIds.length} análises selecionadas?
              </h3>
              <p className="text-xs text-slate-500">
                Os itens marcados serão removidos do armazenamento local do seu navegador permanentemente.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteSelectedOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteSelected}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                Excluir Selecionados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL - CLEAR ALL */}
      {confirmClearAllOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Apagar todo o histórico?
              </h3>
              <p className="text-xs text-slate-500">
                Todas as análises e estatísticas salvas localmente serão zeradas. Recomendamos exportar o JSON antes se desejar guardar uma cópia.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmClearAllOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeClearAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-rose-600/20"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
