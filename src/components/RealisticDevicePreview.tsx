import React, { useState } from "react";
import {
  Smartphone,
  MessageSquare,
  Lock,
  Wifi,
  Battery,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  FileText,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface RealisticExtraMeta {
  bankName?: string;
  amount?: string;
  beneficiary?: string;
  cnpj?: string;
  barcode?: string;
  e2eId?: string;
}

interface RealisticDevicePreviewProps {
  type: "whatsapp" | "sms_lockscreen" | "boleto" | "pix_receipt";
  sender?: string;
  content: string;
  timestamp?: string;
  isSuspicious?: boolean;
  extraMeta?: RealisticExtraMeta;
}

export const RealisticDevicePreview: React.FC<RealisticDevicePreviewProps> = ({
  type,
  sender = "Desconhecido",
  content,
  timestamp = "Agora",
  isSuspicious = true,
  extraMeta = {} as RealisticExtraMeta,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Frame
  if (type === "whatsapp") {
    return (
      <div className="rounded-[28px] overflow-hidden border border-slate-700/80 shadow-2xl bg-[#0b141a] text-slate-100 max-w-sm mx-auto font-sans">
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {sender.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white truncate">{sender}</span>
                {isSuspicious ? (
                  <span className="px-1.5 py-0.2 text-[9px] font-black bg-rose-500/30 text-rose-300 rounded border border-rose-500/40">
                    NÃO SALVO
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[8px] font-black">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block truncate">
                {isSuspicious ? "Número desconhecido / Foto suspeita" : "online"}
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat Canvas */}
        <div
          className="p-4 min-h-[220px] flex flex-col justify-end space-y-3 relative"
          style={{
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
            backgroundColor: "#0b141a",
          }}
        >
          {/* Encryption Notice */}
          <div className="p-2 rounded-lg bg-[#182229] border border-slate-800 text-[10px] text-amber-300/80 text-center mx-auto max-w-[280px] leading-tight">
            🔒 As mensagens são protegidas com a criptografia de ponta a ponta.
          </div>

          {/* Message Bubble */}
          <div className="flex items-end justify-start">
            <div
              className={`max-w-[85%] rounded-2xl rounded-tl-none p-3.5 shadow-md relative text-xs leading-relaxed space-y-2 ${
                isSuspicious
                  ? "bg-[#202c33] text-slate-100 border border-rose-500/30 ring-1 ring-rose-500/20"
                  : "bg-[#202c33] text-slate-100 border border-slate-700"
              }`}
            >
              {isSuspicious && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 border-b border-slate-700 pb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Possível Tentativa de Golpe</span>
                </div>
              )}

              <p className="whitespace-pre-wrap break-words">{content}</p>

              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                <span>{timestamp}</span>
                <span className="text-blue-400 font-bold">✓✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Bottom Input Fake */}
        <div className="bg-[#1f2c34] p-2.5 flex items-center gap-2 border-t border-slate-700/50">
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-1.5 text-xs text-slate-400">
            Mensagem...
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
            🎤
          </div>
        </div>
      </div>
    );
  }

  // SMS Lockscreen Frame
  if (type === "sms_lockscreen") {
    return (
      <div className="rounded-[32px] overflow-hidden border-2 border-slate-800 shadow-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white max-w-sm mx-auto font-sans relative p-5 min-h-[380px] flex flex-col justify-between">
        {/* Lock Screen Status Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium pt-1">
          <span>{sender.includes("VIVO") ? "VIVO" : "CLARO BR"}</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Big Lockscreen Clock */}
        <div className="text-center my-auto space-y-1">
          <Lock className="w-4 h-4 mx-auto text-slate-400 mb-1" />
          <div className="text-5xl font-black tracking-tight text-white/95">
            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-xs text-slate-300 capitalize font-medium">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        {/* Push Notification Banner */}
        <div className="backdrop-blur-xl bg-slate-900/80 rounded-2xl p-3.5 border border-white/10 shadow-2xl space-y-2 my-2 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs">
                💬
              </div>
              <span className="text-xs font-black text-white">{sender}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">agora</span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed line-clamp-4">
            {content}
          </p>

          {isSuspicious && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Alerta de SMS Falso
              </span>
              <span className="text-slate-400 text-[10px]">Não ligue no 0800</span>
            </div>
          )}
        </div>

        {/* Bottom Swipe Bar */}
        <div className="text-center pt-2">
          <div className="w-32 h-1 bg-white/40 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  // Boleto Bancário Frame
  if (type === "boleto") {
    const rawDigits = extraMeta.barcode || "23793.38128 60000.123456 1 91230000028990";
    return (
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white text-slate-900 max-w-md mx-auto p-4 sm:p-5 shadow-lg font-sans space-y-3">
        {/* Boleto Top Bank Line */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-700" />
            <span className="font-black text-sm sm:text-base tracking-tight">
              {extraMeta.bankName || "BANCO BRADESCO S.A."}
            </span>
          </div>
          <span className="font-mono font-black text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            237-2
          </span>
        </div>

        {/* Linha Digitável */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] sm:text-xs font-bold text-center tracking-wider text-slate-800 break-all select-all">
          {rawDigits}
        </div>

        {/* Beneficiary and Values Table */}
        <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Beneficiário Final:</span>
            <strong className="text-slate-900 font-black truncate block">
              {extraMeta.beneficiary || "ASSOCIACAO EMPREENDEDORES LTDA"}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">CNPJ / CPF:</span>
            <strong className="text-slate-900 font-mono block">
              {extraMeta.cnpj || "49.882.119/0001-90"}
            </strong>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Vencimento:</span>
            <strong className="text-slate-900">À Vista / Imediato</strong>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Valor do Documento:</span>
            <strong className="text-rose-600 text-sm font-black">
              {extraMeta.amount || "R$ 289,90"}
            </strong>
          </div>
        </div>

        {/* Barcode Mock Visual */}
        <div className="pt-2 flex flex-col items-center space-y-1">
          <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_8px,#000_8px,#000_12px)] opacity-90 rounded" />
          <span className="text-[10px] font-mono text-slate-400">Autenticação Mecânica / Código de Barras</span>
        </div>

        {isSuspicious && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Atenção: Beneficiário privado fingindo ser órgão governamental (Receita/MEI).</span>
          </div>
        )}
      </div>
    );
  }

  // Pix Receipt Frame
  const e2e = extraMeta.e2eId || `E00416968202408271145${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-w-sm mx-auto p-5 shadow-xl space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-black text-xs">
            PIX
          </div>
          <div>
            <div className="text-xs font-black">Comprovante de Envio Pix</div>
            <div className="text-[10px] text-slate-400">{timestamp}</div>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
            isSuspicious ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {isSuspicious ? "Agendado / Sob Análise" : "Concluído"}
        </span>
      </div>

      {/* Amount Display */}
      <div className="text-center py-2 space-y-0.5">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Valor Transferido</span>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {extraMeta.amount || "R$ 1.800,00"}
        </div>
      </div>

      {/* Origin and Destination Details */}
      <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between">
          <span className="text-slate-400">Destinatário:</span>
          <strong className="font-bold text-slate-800 dark:text-slate-200">
            {extraMeta.beneficiary || "LARANJA CONTAS DE PAGAMENTOS LTDA"}
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Instituição:</span>
          <strong className="font-bold text-slate-800 dark:text-slate-200">
            {extraMeta.bankName || "Banco PagBank / C6 Bank"}
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Chave Pix:</span>
          <strong className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
            {extraMeta.cnpj || "988221049@pix.com"}
          </strong>
        </div>
      </div>

      {/* E2E ID */}
      <div className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all">
        <span className="font-bold text-slate-500 block mb-0.5">ID da Transação E2E (BACEN):</span>
        {e2e}
      </div>

      {isSuspicious && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
          ⚠️ Pix Agendado não significa saldo em conta! Golpistas costumam cancelar agendamentos.
        </div>
      )}
    </div>
  );
};
