import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  Clock,
  FileText,
  Phone,
  Landmark,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Printer,
  ExternalLink,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { BRAZILIAN_BANKS, POLICE_STATIONS } from "../data/bankContacts";
import { VictimDossierInput, AnalysisResult } from "../types";
import { getSavedDossier, saveDossierDraft } from "../utils/storage";

interface VictimGuideViewProps {
  initialData?: Partial<AnalysisResult> | null;
}

export const VictimGuideView: React.FC<VictimGuideViewProps> = ({ initialData }) => {
  const [activeSubTab, setActiveSubTab] = useState<"immediate" | "dossier" | "banks" | "police">("immediate");
  const [bankSearch, setBankSearch] = useState("");
  const [policeSearch, setPoliceSearch] = useState("");
  const [expandedBank, setExpandedBank] = useState<string | null>("nubank");

  // Dossier Generator Form State
  const [formData, setFormData] = useState<VictimDossierInput>({
    victimName: "",
    victimCpf: "",
    victimPhone: "",
    bankName: "Nubank",
    amountLost: "",
    incidentDate: new Date().toISOString().split("T")[0],
    incidentTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    scamType: "Falsa Central Bancária (0800)",
    suspectInfo: "",
    description: "",
    evidenceNotes: "",
  });

  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [generatedDossierText, setGeneratedDossierText] = useState<string | null>(null);
  const [copiedDossier, setCopiedDossier] = useState(false);

  // Load from draft or initial scan data
  useEffect(() => {
    const saved = getSavedDossier();
    if (saved) {
      setFormData(saved);
    }
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        scamType: initialData.scamCategory || prev.scamType,
        description: initialData.summary
          ? `Golpe identificado pelo RadarSeguro: ${initialData.scamCategory}.\nDetalhes: ${initialData.summary}\nConteúdo analisado: ${initialData.inputContent}`
          : prev.description,
      }));
      setActiveSubTab("dossier");
    }
  }, [initialData]);

  const handleInputChange = (field: keyof VictimDossierInput, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveDossierDraft(updated);
  };

  const handleGenerateDossier = async () => {
    if (!formData.victimName.trim() || !formData.amountLost.trim()) {
      alert("Por favor, preencha pelo menos o Nome da Vítima e o Valor do Prejuízo.");
      return;
    }

    setIsGeneratingDossier(true);
    try {
      const response = await fetch("/api/generate-dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          victimData: {
            name: formData.victimName,
            cpf: formData.victimCpf,
            phone: formData.victimPhone,
            bank: formData.bankName,
            amount: formData.amountLost,
            date: `${formData.incidentDate} às ${formData.incidentTime}`,
            description: formData.description,
            suspectAccounts: formData.suspectInfo,
            evidence: formData.evidenceNotes,
          },
          scamData: {
            scamCategory: formData.scamType,
            summary: formData.description,
          },
        }),
      });

      if (!response.ok) throw new Error("Falha ao gerar dossiê");
      const data = await response.json();
      setGeneratedDossierText(data.dossierText);
    } catch (e) {
      console.error(e);
      alert("Erro ao conectar ao motor pericial. Usando modelo padrão formatado.");
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  const handleCopyDossier = () => {
    if (!generatedDossierText) return;
    navigator.clipboard.writeText(generatedDossierText);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  const handleDownloadDossier = () => {
    if (!generatedDossierText) return;
    const blob = new Blob([generatedDossierText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dossie_Fraude_${formData.victimName.replace(/\s+/g, "_") || "Vitima"}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintDossier = () => {
    if (!generatedDossierText) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Dossiê Oficial de Fraude - RadarSeguro</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; padding: 40px; font-size: 13px; line-height: 1.6; color: #111; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${generatedDossierText}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredBanks = BRAZILIAN_BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.code.includes(bankSearch) ||
      b.emergencyPhone.includes(bankSearch)
  );

  const filteredPolice = POLICE_STATIONS.filter(
    (p) =>
      p.state.toLowerCase().includes(policeSearch.toLowerCase()) ||
      p.stateName.toLowerCase().includes(policeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-red-800 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/30 text-red-200 text-xs font-black uppercase tracking-wider border border-red-400/30">
              <AlertOctagon className="w-3.5 h-3.5" /> Central SOS Vítima de Golpe
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              O que fazer nos primeiros 60 minutos
            </h1>
            <p className="text-red-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              Agir rápido aumenta em até 80% a chance de bloqueio do dinheiro via <strong>Mecanismo Especial de Devolução (MED)</strong> do Banco Central.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center flex-shrink-0">
            <Clock className="w-8 h-8 mx-auto text-amber-300 mb-1 animate-pulse" />
            <div className="text-xs uppercase font-bold text-red-200">Janela Crítica</div>
            <div className="text-xl font-black text-white">Até 72 Horas</div>
            <div className="text-[10px] text-red-200/80">Resolução BCB nº 103/21</div>
          </div>
        </div>
      </div>

      {/* Subtabs navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab("immediate")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "immediate"
              ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Passo a Passo</span>
        </button>

        <button
          onClick={() => setActiveSubTab("dossier")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "dossier"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Gerador de Dossiê</span>
        </button>

        <button
          onClick={() => setActiveSubTab("banks")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "banks"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Contatos dos Bancos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("police")}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === "police"
              ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>B.O. por Estado</span>
        </button>
      </div>

      {/* 1. Passo a Passo Imediato */}
      {activeSubTab === "immediate" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                Acione o MED no seu Banco
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Abra o app do seu banco ou ligue no SAC de emergência. Informe claramente que <strong>foi vítima de fraude/engenharia social</strong> e exija a abertura do <strong>MED (Mecanismo Especial de Devolução)</strong>.
              </p>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-[11px] text-red-800 dark:text-red-300 font-semibold">
                ⚠️ Anote na hora o <strong>número de protocolo</strong> da ligação.
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                Junte Provas e Prints
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Tire print de todas as conversas do WhatsApp/Telegram (mostrando o número do golpista), do comprovante do Pix com o <strong>ID/E2E da transação</strong> e do extrato bancário.
              </p>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
                📌 Não apague a conversa e não bloqueie antes de tirar prints.
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                Registre o B.O. Online
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Acesse a Delegacia Eletrônica do seu estado e registre um Boletim de Ocorrência por <strong>Estelionato Eletrônico (Art. 171, §2º-A do CP)</strong>. Envie cópia do B.O. para o seu banco.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                ⚖️ Use o Dossiê do RadarSeguro para preencher o B.O. em 2 minutos.
              </div>
            </div>
          </div>

          {/* Quick CTA to Generator */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black">Precisa de um texto formal pronto para o B.O. e Banco?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Nosso gerador pericial estrutura a narrativa com termos jurídicos e resolução do Banco Central.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab("dossier")}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>GERAR DOSSIÊ POLICIAL</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Gerador de Dossiê Oficial */}
      {activeSubTab === "dossier" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" /> Assistente Pericial
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Gerador de Dossiê e Petição MED / B.O.
              </h2>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Nome Completo da Vítima *
              </label>
              <input
                type="text"
                value={formData.victimName}
                onChange={(e) => handleInputChange("victimName", e.target.value)}
                placeholder="Ex: Carlos Eduardo da Silva"
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Seu Banco de Origem (onde saiu o dinheiro) *
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => handleInputChange("bankName", e.target.value)}
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {BRAZILIAN_BANKS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} (Código {b.code})
                  </option>
                ))}
                <option value="Outro Banco">Outro Banco / Fintech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Valor Total do Prejuízo (R$) *
              </label>
              <input
                type="text"
                value={formData.amountLost}
                onChange={(e) => handleInputChange("amountLost", e.target.value)}
                placeholder="Ex: 2.850,00"
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Tipo / Modalidade do Golpe
              </label>
              <select
                value={formData.scamType}
                onChange={(e) => handleInputChange("scamType", e.target.value)}
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Falsa Central Bancária (0800)">Falsa Central Bancária (0800 / SMS)</option>
                <option value="Golpe do WhatsApp (Falso Parente / Novo Número)">Golpe do WhatsApp (Falso Parente / Novo Número)</option>
                <option value="Falsa Taxa dos Correios / Alfândega">Falsa Taxa dos Correios / Alfândega</option>
                <option value="Golpe da Mão Fantasma / Acesso Remoto (AnyDesk)">Golpe da Mão Fantasma / Acesso Remoto</option>
                <option value="Falso Emprego / Tarefas de Telegram">Falso Emprego / Tarefas de Telegram</option>
                <option value="Falso Boleto / Benefício Adulterado">Falso Boleto / Benefício Adulterado</option>
                <option value="Golpe do Comprovante Pix Falso / Agendado">Golpe do Comprovante Pix Falso / Agendado</option>
                <option value="Outro Tipo de Fraude Eletrônica">Outro Tipo de Fraude Eletrônica</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Dados do Suspeito (Chave Pix, Nome do Beneficiário, Banco de Destino ou Telefone)
              </label>
              <input
                type="text"
                value={formData.suspectInfo}
                onChange={(e) => handleInputChange("suspectInfo", e.target.value)}
                placeholder="Ex: Chave Pix CPF: 123.456.789-00 / Beneficiário: João da Silva / Banco Destino: PagBank / WhatsApp: (11) 98765-4321"
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Como aconteceu o golpe? (Breve resumo com suas palavras)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Ex: Recebi um SMS do suposto banco informando compra de R$ 3.800 nas Casas Bahia e pedindo para ligar no 0800. O atendente disse que minha conta estava em risco e me fez transferir para uma conta cofre temporária..."
                className="w-full rounded-xl p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action to Generate */}
          <button
            onClick={handleGenerateDossier}
            disabled={isGeneratingDossier}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isGeneratingDossier ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Gerando Dossiê Jurídico & Técnico com IA...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>GERAR DOSSIÊ OFICIAL FORMATADO</span>
              </>
            )}
          </button>

          {/* Output text area */}
          {generatedDossierText && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Dossiê Pericial Pronto para Uso
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDossier}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDossier ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                  <button
                    onClick={handleDownloadDossier}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar (.txt)</span>
                  </button>
                  <button
                    onClick={handlePrintDossier}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                {generatedDossierText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Diretório Telefônico dos Bancos */}
      {activeSubTab === "banks" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Canais de Emergência e SAC dos Bancos
              </h2>
              <p className="text-xs text-slate-500">
                Ligue imediatamente para solicitar a abertura do <strong>Mecanismo Especial de Devolução (MED)</strong>.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                placeholder="Buscar banco ou código..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredBanks.map((bank) => {
              const isExpanded = expandedBank === bank.id;
              return (
                <div
                  key={bank.id}
                  className="rounded-2xl p-4 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 transition-all"
                >
                  <div
                    onClick={() => setExpandedBank(isExpanded ? null : bank.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm"
                        style={{ backgroundColor: bank.logoColor }}
                      >
                        {bank.code}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {bank.name}
                        </div>
                        <div className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {bank.emergencyPhone}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">SAC Geral: </span>
                        <strong className="text-slate-800 dark:text-slate-200 font-mono">{bank.sacPhone}</strong>
                      </div>
                      {bank.antiFraudEmail && (
                        <div>
                          <span className="text-slate-500">E-mail Antifraude: </span>
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">{bank.antiFraudEmail}</strong>
                        </div>
                      )}
                      <div className="mt-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-[11px] space-y-1">
                        <div className="font-bold">Como acionar o MED neste banco:</div>
                        {bank.tips.map((tip, i) => (
                          <div key={i}>• {tip}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Lista de Delegacias Eletrônicas */}
      {activeSubTab === "police" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Delegacias Eletrônicas por Estado
              </h2>
              <p className="text-xs text-slate-500">
                Registre o Boletim de Ocorrência oficial pela internet em poucos minutos.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={policeSearch}
                onChange={(e) => setPoliceSearch(e.target.value)}
                placeholder="Buscar estado (ex: SP, RJ, Pará)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPolice.map((station) => (
              <a
                key={station.state}
                href={station.url}
                target="_blank"
                rel="noreferrer noopener"
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      {station.state}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {station.stateName}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {station.notes}
                  </p>
                </div>
                <div className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Acessar Portal Oficial</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
