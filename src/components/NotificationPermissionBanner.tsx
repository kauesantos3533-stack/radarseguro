import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  Volume2,
  ExternalLink,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isRealtimeProtectionEnabled,
  setRealtimeProtectionEnabled,
  triggerSecurityAlertNotification,
} from "../utils/notifications";

export const NotificationPermissionBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    if (isNotificationSupported()) {
      const currentPerm = getNotificationPermission();
      setPermission(currentPerm);
      setIsEnabled(isRealtimeProtectionEnabled());

      if (currentPerm === "default") {
        // Show unobtrusive prompt
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === "granted") {
      triggerSecurityAlertNotification({
        title: "🛡️ RadarSeguro: Proteção em Tempo Real Ativada",
        body: "Você será avisado instantaneamente no navegador se detectar links maliciosos ou tentativas de golpe.",
        risk: "low",
      });
      setShowBanner(false);
    }
  };

  const handleToggleProtection = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    setRealtimeProtectionEnabled(next);
  };

  const handleTestNotification = () => {
    setTested(true);
    triggerSecurityAlertNotification({
      title: "🚨 Alerta de Phishing Detectado (Teste)",
      body: "Tentativa de acesso a domínio clonado de instituição bancária detectada.",
      risk: "critical",
      url: "https://rastreio-correios-taxa.xyz",
    });
    setTimeout(() => setTested(false), 3000);
  };

  if (!isNotificationSupported()) return null;

  return (
    <>
      {/* Floating Permission Request Banner (if permission is default) */}
      {showBanner && permission === "default" && (
        <div className="fixed bottom-20 right-4 sm:right-8 z-40 max-w-md bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-blue-500/30 animate-fade-in backdrop-blur-lg">
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3.5 pr-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/40">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                Ativar Alertas no Navegador
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Receba alertas sonoros e notificações imediatas caso tente acessar links falsos ou páginas clonadas de bancos.
              </p>
              <div className="flex items-center gap-2 mt-3.5">
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Permitir Notificações
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
                >
                  Agora Não
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Status Indicator in Header / Dashboard */}
      <div className="flex items-center gap-2 text-xs">
        {permission === "granted" ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Proteção Ativa no Navegador</span>
            <span className="sm:hidden">Alertas On</span>
            <button
              onClick={handleTestNotification}
              title="Disparar som e notificação de teste"
              className="ml-1 hover:underline text-[10px] text-emerald-700 dark:text-emerald-300 font-bold cursor-pointer"
            >
              {tested ? "Enviado!" : "Testar"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRequestPermission}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium transition-colors cursor-pointer"
            title="Clique para habilitar notificações do navegador"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Ativar Alertas de Risco</span>
          </button>
        )}
      </div>
    </>
  );
};
