import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  X,
  Lock,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  PhoneCall,
} from "lucide-react";
import { playAlertTone } from "../utils/notifications";

interface PhishingBlockerModalProps {
  url: string;
  threatDetails?: {
    scamCategory?: string;
    riskScore?: number;
    impersonatedBrand?: string;
    redFlags?: string[];
  };
  onClose: () => void;
  onProceedAnyway: () => void;
  onGoToVictim?: () => void;
}

export const PhishingBlockerModal: React.FC<PhishingBlockerModalProps> = ({
  url,
  threatDetails,
  onClose,
  onProceedAnyway,
  onGoToVictim,
}) => {
  React.useEffect(() => {
    playAlertTone();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500/80 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing backdrop circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center flex-shrink-0 animate-bounce">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <div className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500 text-white mb-1">
              🚨 ACESSO BLOQUEADO POR SEGURANÇA
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Site Fraudulento Detectado
            </h3>
          </div>
        </div>

        {/* Threat Description */}
        <p className="text-sm text-red-200/90 leading-relaxed mb-5">
          O <strong>RadarSeguro</strong> interceptou este link porque ele apresenta padrões característicos de golpe eletrônico, roubo de senhas (phishing) ou clonagem de página bancária.
        </p>

        {/* Suspicious URL Display */}
        <div className="p-3.5 rounded-2xl bg-black/50 border border-red-500/30 mb-5">
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Link Malicioso Identificado:</span>
            <span className="text-red-300 font-mono text-[10px]">
              Risco: {threatDetails?.riskScore || 95}%
            </span>
          </div>
          <div className="font-mono text-xs text-red-300 break-all select-all font-semibold">
            {url}
          </div>
        </div>

        {/* Specific Red Flags */}
        {threatDetails?.redFlags && threatDetails.redFlags.length > 0 && (
          <div className="space-y-1.5 mb-6 text-xs text-slate-300">
            <div className="font-bold text-slate-200">Motivos do Bloqueio:</div>
            {threatDetails.redFlags.slice(0, 3).map((flag, idx) => (
              <div key={idx} className="flex items-start gap-2 text-red-300/90">
                <span className="text-red-400 font-bold">•</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Segurança (Recomendado)</span>
          </button>

          <div className="flex items-center justify-between pt-2">
            {onGoToVictim && (
              <button
                onClick={onGoToVictim}
                className="text-xs text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Já digitei dados neste site?</span>
              </button>
            )}

            <button
              onClick={onProceedAnyway}
              className="text-[11px] text-slate-500 hover:text-slate-400 hover:underline cursor-pointer ml-auto"
            >
              Ignorar aviso e prosseguir (Alto Risco)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
