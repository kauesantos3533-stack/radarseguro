import React, { useState, useRef } from "react";
import {
  Shield,
  CreditCard,
  Phone,
  Link as LinkIcon,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  AlertOctagon,
  Sparkles,
  UploadCloud,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  PhoneCall,
  Bot,
  Smartphone,
  Cpu,
  Eye,
} from "lucide-react";
import { AnalysisResult, AnalysisType } from "../types";
import { RiskMeter } from "./RiskMeter";
import { saveToHistory } from "../utils/storage";
import { PhoneCallSimulatorModal } from "./PhoneCallSimulatorModal";
import { RealisticDevicePreview } from "./RealisticDevicePreview";
import { ForensicInspectorModal } from "./ForensicInspectorModal";
import { PhishingBlockerModal } from "./PhishingBlockerModal";
import { triggerSecurityAlertNotification } from "../utils/notifications";

interface AnalyzerViewProps {
  onGoToVictim: (initialData?: Partial<AnalysisResult>) => void;
  onScanComplete?: (result: AnalysisResult) => void;
  onGoToAssistant?: (contextPrompt?: string) => void;
}

const PRESET_SCENARIOS = [
  {
    label: "📱 Falsa Central 0800",
    type: "phone" as AnalysisType,
    text: "BB INFORMA: Compra no valor de R$ 3.890,00 aprovada no Mercado Livre. Caso nao reconheca, ligue imediatamente para a Central de Seguranca: 0800 789 2011",
  },
  {
    label: "💬 WhatsApp Novo Número",
    type: "message" as AnalysisType,
    text: "Oi mãe, salva meu número novo por favor. Meu celular quebrou a tela e estou usando esse provisório. Preciso pagar um fornecedor agora de R$ 680 mas o app do banco bloqueou no chip novo. Consegue fazer um Pix pra ele que te devolvo amanhã?",
  },
  {
    label: "📦 Taxa Falsa dos Correios",
    type: "link" as AnalysisType,
    text: "CORREIOS: Sua encomenda NX918237492BR foi retida na alfandega. Pague a taxa de liberacao em 24h para evitar devolucao: https://correios-tributo-online.site/rastreio",
  },
  {
    label: "💼 Falso Emprego / Tarefas",
    type: "message" as AnalysisType,
    text: "Olá! Somos do RH do TikTok/Shopee. Temos vagas para trabalhar avaliando vídeos 30 min por dia. Ganhe de R$ 200 a R$ 800 diários. Para começar e receber bônus de R$ 20, entre no Telegram.",
  },
  {
    label: "💳 Chave Pix Aleatória",
    type: "pix" as AnalysisType,
    text: "Chave Pix: 7c9e6679-7425-40de-944b-e07fc1f90ae7 (Beneficiário: PAGSEGURO INTERMEDIACAO LTDA / Destino: Pagamentos Diversos)",
  },
  {
    label: "✅ Mensagem Segura",
    type: "message" as AnalysisType,
    text: "Sua fatura do cartão com vencimento em 10/09 no valor de R$ 142,50 está disponível para consulta no aplicativo oficial do seu banco.",
  },
];

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({ onGoToVictim, onScanComplete, onGoToAssistant }) => {
  const [selectedType, setSelectedType] = useState<AnalysisType>("general");
  const [inputContent, setInputContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/png");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Realistic Simulation States
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isForensicModalOpen, setIsForensicModalOpen] = useState(false);
  const [showRealisticDevice, setShowRealisticDevice] = useState(false);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<"whatsapp" | "sms_lockscreen" | "boleto" | "pix_receipt">("sms_lockscreen");

  // Real-time link/phishing interceptor modal state
  const [blockedThreat, setBlockedThreat] = useState<{
    url: string;
    riskScore?: number;
    scamCategory?: string;
    redFlags?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const actionTypes = [
    { id: "general", label: "Tudo / Rápido", icon: Shield, placeholder: "Cole a mensagem, link, chave Pix ou telefone suspeito..." },
    { id: "pix", label: "Chave Pix", icon: CreditCard, placeholder: "Cole a chave Pix (CPF, CNPJ, E-mail, Telefone ou Chave Aleatória) e nome do beneficiário..." },
    { id: "phone", label: "Telefone / 0800", icon: Phone, placeholder: "Digite o número de telefone, DDD ou 0800 suspeito..." },
    { id: "link", label: "Link / Site", icon: LinkIcon, placeholder: "Cole o endereço do site (URL) para checarmos domínios clonados..." },
    { id: "message", label: "Mensagem / SMS", icon: MessageSquare, placeholder: "Cole a mensagem de SMS, WhatsApp, Telegram ou e-mail recebida..." },
    { id: "image", label: "Print de Tela", icon: ImageIcon, placeholder: "Envie um print ou foto da conversa, comprovante ou tela suspeita..." },
    { id: "boleto", label: "Boleto", icon: FileText, placeholder: "Cole a linha digitável do boleto ou dados do beneficiário..." },
  ];

  const currentTypeConfig = actionTypes.find((t) => t.id === selectedType) || actionTypes[0];

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).");
      return;
    }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setSelectedType("image");
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = inputContent.trim();
    if (!textToAnalyze && !selectedImage) {
      setErrorMessage("Por favor, digite um texto, cole uma informação ou envie um print de tela para análise.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToAnalyze,
          type: selectedType,
          imageBase64: selectedImage,
          mimeType: imageMime,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor.");
      }

      const data: AnalysisResult = await response.json();
      data.inputContent = textToAnalyze || "Print de tela anexado";
      data.type = selectedType;
      data.timestamp = Date.now();
      data.imagePreview = selectedImage || undefined;

      setResult(data);
      saveToHistory(data);
      if (onScanComplete) {
        onScanComplete(data);
      }

      // Trigger local browser notification & sound if medium/high risk
      if (data.risk === "high" || data.risk === "critical") {
        const detectedUrlMatch = textToAnalyze.match(/https?:\/\/[^\s]+/i);
        const detectedUrl = detectedUrlMatch ? detectedUrlMatch[0] : undefined;

        triggerSecurityAlertNotification({
          title: `🚨 Alerta de Golpe Detectado: ${data.scamCategory}`,
          body: data.summary,
          risk: data.risk,
          url: detectedUrl,
          category: data.scamCategory,
        });

        // If it is a link/phishing risk, open the interceptor blocker
        if (selectedType === "link" || detectedUrl) {
          setBlockedThreat({
            url: detectedUrl || textToAnalyze,
            riskScore: data.riskScore,
            scamCategory: data.scamCategory,
            redFlags: data.redFlags,
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Ocorreu uma falha ao processar a verificação. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSelectedType(preset.type);
    setInputContent(preset.text);
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `[RadarSeguro - Relatório Antifraude]
Risco: ${result.risk.toUpperCase()} (${result.riskScore}%)
Categoria: ${result.scamCategory}
Título: ${result.title}
Resumo: ${result.summary}

Sinais de Alerta:
${result.redFlags.map((r) => `• ${r}`).join("\n")}

Recomendações:
${result.recommendations.map((r) => `• ${r}`).join("\n")}

Verificado em: ${new Date().toLocaleString("pt-BR")}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setInputContent("");
    setSelectedImage(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Motor de Inteligência Antifraude
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Verifique antes de transferir ou clicar.
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
            Analise instantaneamente chaves Pix, links maliciosos, números 0800, ofertas falsas e prints de mensagens suspeitas.
          </p>
        </div>
      </div>

      {/* Preset Scenarios / Quick Test Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            🧪 Testes Rápidos / Exemplos Reais
          </span>
          <span className="text-xs text-slate-400">Clique para testar</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_SCENARIOS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleSelectPreset(preset)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Terminal Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Category Pills */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            1. O que você quer analisar?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {actionTypes.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`type-btn-${tab.id}`}
                  onClick={() => setSelectedType(tab.id as AnalysisType)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl text-xs font-bold border transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                      : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Conteúdo para verificação
            </label>
            {inputContent && (
              <button
                onClick={() => setInputContent("")}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Limpar texto
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              id="analysis-input-field"
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={currentTypeConfig.placeholder}
              rows={4}
              className="w-full rounded-2xl p-4 text-sm sm:text-base bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y min-h-[110px]"
            />
          </div>

          {/* Screenshot / Image Upload Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 transition-all ${
              selectedImage
                ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-900/50"
            }`}
          >
            {selectedImage ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Print para análise"
                    className="w-16 h-16 object-cover rounded-xl border border-blue-200 dark:border-blue-800"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Print de Tela Anexado
                    </div>
                    <div className="text-xs text-slate-500">
                      A imagem será avaliada visualmente pelo motor pericial.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      Tem print da conversa ou do comprovante?
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-500">
                      Arraste a imagem aqui ou clique para selecionar.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                >
                  Escolher Imagem
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            id="analyze-submit-button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Analisando com Inteligência Antifraude...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>ANALISAR AGORA COM RADAR SEGURO</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div
          id="analysis-result-section"
          className="bg-white dark:bg-slate-800/95 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 animate-scale-up"
        >
          {/* Header & Gauge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                Resultado da Perícia Antifraude
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {result.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Categoria identificada: <strong className="text-slate-700 dark:text-slate-300">{result.scamCategory}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="Copiar relatório"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copiado!" : "Copiar"}</span>
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Nova Análise</span>
              </button>
            </div>
          </div>

          {/* Risk Meter Visual */}
          <RiskMeter score={result.riskScore} risk={result.risk} size="lg" />

          {/* REALISTIC SIMULATION & FORENSIC SUITE ACTION BAR */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Ferramentas de Simulação Realista & Perícia
              </span>
              <span className="text-[11px] text-slate-400">Interações de Alta Fidelidade</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Phone Call Simulator Button */}
              <button
                onClick={() => setIsPhoneModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simular Chamada 0800 com Áudio</span>
              </button>

              {/* Digital Forensics Button */}
              <button
                onClick={() => setIsForensicModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-blue-600/30 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-200" />
                <span>Laudo Forense (WHOIS / CNPJ / Telecom)</span>
              </button>

              {/* Toggle Realistic Device Preview */}
              <button
                onClick={() => {
                  setShowRealisticDevice(!showRealisticDevice);
                  // auto-select best preview mode based on content
                  const text = result.inputContent.toLowerCase();
                  if (text.includes("whatsapp") || text.includes("oi pai") || text.includes("oi mãe")) {
                    setPreviewDeviceMode("whatsapp");
                  } else if (text.includes("boleto") || text.includes("darf") || text.includes("codigo de barras")) {
                    setPreviewDeviceMode("boleto");
                  } else if (text.includes("chave pix") || text.includes("comprovante")) {
                    setPreviewDeviceMode("pix_receipt");
                  } else {
                    setPreviewDeviceMode("sms_lockscreen");
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showRealisticDevice
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-white/10 hover:bg-white/20 text-slate-200"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{showRealisticDevice ? "Ocultar Mockup Realista" : "Ver no Celular Realista"}</span>
              </button>
            </div>

            {/* Realistic Device In-line Preview Container */}
            {showRealisticDevice && (
              <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-medium">Modo de Exibição:</span>
                    {[
                      { id: "sms_lockscreen", label: "📱 Tela de Bloqueio (SMS)" },
                      { id: "whatsapp", label: "💬 WhatsApp" },
                      { id: "boleto", label: "📄 Boleto Bancário" },
                      { id: "pix_receipt", label: "💳 Comprovante Pix" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setPreviewDeviceMode(mode.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          previewDeviceMode === mode.id
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-slate-300 hover:bg-white/20"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-2">
                  <RealisticDevicePreview
                    type={previewDeviceMode}
                    sender={result.scamCategory || "Notificação Bancária"}
                    content={result.inputContent}
                    isSuspicious={result.risk !== "low"}
                    extraMeta={{
                      bankName: "Banco Inter / Bradesco",
                      amount: result.inputContent.match(/R\$\s?[\d.,]+/)?.[0] || "R$ 4.290,00",
                      beneficiary: "CENTRAL RECEBIMENTOS DIGITAIS",
                      cnpj: "49.882.119/0001-90",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Diagnóstico Rápido
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Red Flags Identified */}
          {result.redFlags && result.redFlags.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Sinais de Alerta Identificados ({result.redFlags.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {result.redFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-900 dark:text-rose-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations & Actionable Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> O que fazer agora (Prevenção)
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
              <h3 className="text-sm font-black text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" /> Canais Oficiais de Checagem
              </h3>
              <div className="space-y-2">
                {result.officialChannels && result.officialChannels.length > 0 ? (
                  result.officialChannels.map((chan, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 text-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{chan.name}</div>
                      <div className="text-blue-600 dark:text-blue-400 font-mono font-bold mt-0.5">{chan.contact}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{chan.note}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Ligue sempre no telefone oficial que consta no verso do seu cartão bancário físico.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-white block mb-1">Como funciona a engenharia social deste golpe:</strong>
              {result.explanation}
            </div>
          )}

          {/* AI Assistant Quick Consultation Banner */}
          {onGoToAssistant && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">Dúvidas sobre este resultado? Fale com a IA 24h</h4>
                  <p className="text-[11px] text-blue-200">
                    Nosso assistente automático responde suas dúvidas e orienta como agir passo a passo.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onGoToAssistant(`Analisei uma mensagem suspeita sobre "${result.scamCategory}". O que mais devo fazer para me proteger?`)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
              >
                <span>Perguntar ao Atendimento IA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Victim Action CTA (if user was scammed) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-red-500/20">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="text-base font-black">Você já caiu ou fez a transferência?</h4>
                <p className="text-xs text-red-100 leading-snug">
                  Gere o Dossiê Policial e o protocolo do MED (Devolução do Pix) com estes dados pré-preenchidos.
                </p>
              </div>
            </div>
            <button
              onClick={() => onGoToVictim(result)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-red-700 font-black text-xs sm:text-sm hover:bg-red-50 transition-colors shadow-md flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <span>ACIONAR SOS GOLPE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Safety Alert Box */}
      <div className="bg-blue-50 dark:bg-blue-950/40 rounded-3xl p-6 border border-blue-200 dark:border-blue-900 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-900 dark:text-blue-100">
            Regra de Ouro da Segurança Digital
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200/90 leading-relaxed">
            Bancos e instituições NUNCA solicitam senhas, tokens de autenticação por telefone ou pedem para você fazer um Pix para “cancelar” compras ou “proteger sua conta”. Em caso de dúvida, desligue a chamada e use o canal oficial.
          </p>
        </div>
      </div>

      {/* Realistic Phone Call Simulation Modal */}
      <PhoneCallSimulatorModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        callerName={result?.scamCategory || "Central de Segurança Bancária"}
        callerNumber="0800 789 2011"
        scamScenario={result?.inputContent}
      />

      {/* Forensic Intelligence Modal */}
      <ForensicInspectorModal
        isOpen={isForensicModalOpen}
        onClose={() => setIsForensicModalOpen(false)}
        analysis={result}
      />

      {/* Real-time Link/Phishing Threat Interceptor Modal */}
      {blockedThreat && (
        <PhishingBlockerModal
          url={blockedThreat.url}
          threatDetails={{
            riskScore: blockedThreat.riskScore,
            scamCategory: blockedThreat.scamCategory,
            redFlags: blockedThreat.redFlags,
          }}
          onClose={() => setBlockedThreat(null)}
          onProceedAnyway={() => {
            const urlToOpen = blockedThreat.url.startsWith("http")
              ? blockedThreat.url
              : `https://${blockedThreat.url}`;
            window.open(urlToOpen, "_blank", "noopener,noreferrer");
            setBlockedThreat(null);
          }}
          onGoToVictim={() => {
            const threat = blockedThreat;
            setBlockedThreat(null);
            onGoToVictim({
              title: `Alerta Phishing: ${threat.scamCategory || "Site Fraudulento"}`,
              inputContent: threat.url,
              scamCategory: threat.scamCategory,
              risk: "critical",
              riskScore: threat.riskScore || 95,
            });
          }}
        />
      )}
    </div>
  );
};
