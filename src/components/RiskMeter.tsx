import React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";
import { RiskLevel } from "../types";

interface RiskMeterProps {
  score: number;
  risk: RiskLevel;
  size?: "sm" | "md" | "lg";
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, risk, size = "md" }) => {
  const getColorClasses = () => {
    switch (risk) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500",
          text: "text-red-600 dark:text-red-400",
          bar: "bg-red-600",
          badge: "bg-red-600 text-white",
          label: "Perigo Crítico",
          icon: ShieldX,
        };
      case "high":
        return {
          bg: "bg-rose-500/10",
          border: "border-rose-500",
          text: "text-rose-600 dark:text-rose-400",
          bar: "bg-rose-500",
          badge: "bg-rose-600 text-white",
          label: "Alto Risco",
          icon: ShieldAlert,
        };
      case "medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500",
          text: "text-amber-600 dark:text-amber-400",
          bar: "bg-amber-500",
          badge: "bg-amber-500 text-slate-900",
          label: "Atenção / Suspeito",
          icon: AlertTriangle,
        };
      case "low":
      default:
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500",
          text: "text-emerald-600 dark:text-emerald-400",
          bar: "bg-emerald-500",
          badge: "bg-emerald-600 text-white",
          label: "Baixo Risco",
          icon: ShieldCheck,
        };
    }
  };

  const style = getColorClasses();
  const Icon = style.icon;

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
        <Icon className="w-3.5 h-3.5" />
        {style.label} ({score}%)
      </span>
    );
  }

  return (
    <div className={`rounded-2xl p-5 border ${style.border} ${style.bg} transition-all`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${style.badge}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-bold opacity-75">Nível de Risco Calculado</div>
            <div className={`text-xl font-black ${style.text}`}>{style.label}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black tracking-tight">{score}%</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Probabilidade de Fraude</div>
        </div>
      </div>

      {/* Visual Meter Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
        <div
          className={`h-full ${style.bar} transition-all duration-700 rounded-full`}
          style={{ width: `${Math.max(score, 5)}%` }}
        />
      </div>
    </div>
  );
};
