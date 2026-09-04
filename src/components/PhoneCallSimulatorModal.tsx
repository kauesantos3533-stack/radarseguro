import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Grid,
  ShieldAlert,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Radio,
} from "lucide-react";

interface PhoneCallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  callerNumber?: string;
  scamScenario?: string;
}

export const PhoneCallSimulatorModal: React.FC<PhoneCallSimulatorModalProps> = ({
  isOpen,
  onClose,
  callerName = "Central de Segurança Bancária",
  callerNumber = "0800 799 4421",
  scamScenario = "Compra aprovada de R$ 4.290,00 na Magazine Luiza",
}) => {
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState("");
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const durationTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const DIALOGUE_SCRIPT = [
    {
      speaker: "URA Automática",
      text: `Atenção: Central de Notificações de Segurança. Uma transação no valor de quatro mil duzentos e noventa reais foi realizada no seu cartão de crédito nas Casas Bahia. Se você reconhece esta compra, digite 1. Se você NÃO reconhece e deseja cancelar, digite 2 agora.`,
      actionExpected: "2",
    },
    {
      speaker: "Falso Atendente (Golpista)",
      text: `Olá, senhor(a). Meu nome é Carlos Eduardo, da Central Antifraude. Estamos com a transação bloqueada preventivamente em nosso sistema. Para cancelarmos imediatamente e evitar cobrança na fatura, preciso que você confirme o código de 6 dígitos que enviamos no seu SMS ou faça a validação de segurança pelo aplicativo.`,
      actionExpected: "any",
    },
    {
      speaker: "Falso Atendente (Golpista)",
      text: `Perfeito. Agora vou gerar uma chave de segurança provisória. Por favor, acesse a opção Pix no seu aplicativo, selecione transferir e digite a nossa chave Pix do cofre de segurança. Não se preocupe, o valor não sairá da sua conta, é apenas um estorno espelhado do Banco Central.`,
      actionExpected: "any",
    },
  ];

  // Ringing audio generator using Web Audio API
  const playRingtone = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);
    } catch {}
  };

  // Play DTMF keypad tone
  const playKeypadTone = (key: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(key === "1" ? 697 : key === "2" ? 770 : 852, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  };

  // Speech synthesis for dialogue
  const speakCurrentScript = (index: number) => {
    if (!("speechSynthesis" in window) || !isSpeakerOn) return;
    window.speechSynthesis.cancel();

    const scriptItem = DIALOGUE_SCRIPT[index];
    if (!scriptItem) return;

    const utterance = new SpeechSynthesisUtterance(scriptItem.text);
    utterance.lang = "pt-BR";
    utterance.rate = index === 0 ? 0.95 : 1.05; // URA is slightly formal/slow, attendant is conversational
    utterance.pitch = index === 0 ? 0.9 : 1.0;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Ring interval when in ringing state
  useEffect(() => {
    if (!isOpen) return;

    if (callState === "ringing") {
      playRingtone();
      const ringInterval = setInterval(() => {
        playRingtone();
      }, 3000);
      return () => clearInterval(ringInterval);
    }
  }, [isOpen, callState]);

  // Call duration counter
  useEffect(() => {
    if (callState === "connected") {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCallState("ringing");
      setCallDuration(0);
      setCurrentDialogueIndex(0);
      setKeypadInput("");
      setShowKeypad(false);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  const handleAnswerCall = () => {
    setCallState("connected");
    setTimeout(() => {
      speakCurrentScript(0);
    }, 500);
  };

  const handleHangUp = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCallState("ended");
  };

  const handleKeypadPress = (digit: string) => {
    playKeypadTone(digit);
    setKeypadInput((prev) => prev + digit);

    if (callState === "connected") {
      if (currentDialogueIndex === 0 && (digit === "1" || digit === "2")) {
        // Advance to attendant dialogue
        setTimeout(() => {
          setCurrentDialogueIndex(1);
          speakCurrentScript(1);
        }, 1000);
      } else if (currentDialogueIndex === 1) {
        setTimeout(() => {
          setCurrentDialogueIndex(2);
          speakCurrentScript(2);
        }, 1200);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-950 text-white rounded-[40px] max-w-sm w-full p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Dynamic Notch / Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full border border-slate-800/80 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/50" />
        </div>

        {/* Close Demo Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header & Simulated Carrier */}
        <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium px-2">
          <span>VIVO 5G</span>
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> SIMULADOR DE GOLPE REAL
          </span>
          <span>100%</span>
        </div>

        {/* Caller Info Block */}
        <div className="text-center my-auto space-y-3">
          <div className="relative inline-block">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-xl transition-all ${
                callState === "ringing"
                  ? "bg-gradient-to-tr from-amber-600 to-rose-600 animate-pulse ring-8 ring-amber-500/20"
                  : callState === "connected"
                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-500/30"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              <PhoneCall className={`w-10 h-10 ${callState === "ringing" ? "animate-bounce" : ""}`} />
            </div>

            {callState === "connected" && isAiSpeaking && (
              <span className="absolute -bottom-1 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md">
                <Radio className="w-2.5 h-2.5" /> Falando...
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight">{callerName}</h2>
            <p className="text-sm font-mono text-slate-300 font-bold">{callerNumber}</p>
            <div className="text-xs font-semibold text-slate-400">
              {callState === "ringing" && (
                <span className="text-amber-400 animate-pulse font-bold">Chamada Recebida...</span>
              )}
              {callState === "connected" && (
                <span className="text-emerald-400 font-mono">{formatDuration(callDuration)}</span>
              )}
              {callState === "ended" && <span className="text-rose-400">Chamada Encerrada</span>}
            </div>
          </div>

          {/* Subtitle / Script Box */}
          {callState === "connected" && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                <span className="text-amber-400 font-black flex items-center gap-1">
                  🎙️ {DIALOGUE_SCRIPT[currentDialogueIndex]?.speaker || "Atendente"}
                </span>
                <span className="text-slate-500">Áudio Reproduzido</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                "{DIALOGUE_SCRIPT[currentDialogueIndex]?.text}"
              </p>

              {currentDialogueIndex === 0 && (
                <div className="pt-2 text-[11px] text-amber-300 font-bold animate-pulse flex items-center gap-1">
                  👉 Toque no teclado abaixo e digite 1 ou 2 para prosseguir
                </div>
              )}
            </div>
          )}

          {/* Forensic Trap Explanation */}
          {callState === "connected" && currentDialogueIndex >= 1 && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-left text-[11px] text-rose-200 space-y-1">
              <strong className="font-black text-rose-400 flex items-center gap-1">
                ⚠️ Armadilha do Golpe Revelada:
              </strong>
              <span>
                O criminoso finge que vai estornar uma compra, mas induz você a fazer um Pix para a conta dele ("cofre de segurança"). Bancos NUNCA pedem transferências de cancelamento!
              </span>
            </div>
          )}
        </div>

        {/* Keypad View if Toggled */}
        {showKeypad && callState === "connected" && (
          <div className="p-3 rounded-2xl bg-slate-900/95 border border-slate-800 mb-4 animate-scale-up">
            <div className="text-center font-mono text-base font-bold text-white mb-2 tracking-widest min-h-[24px]">
              {keypadInput || "Digite..."}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleKeypadPress(d)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold text-base transition-colors cursor-pointer"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-900">
          {callState === "ringing" ? (
            <div className="flex items-center justify-around px-4">
              <div className="text-center space-y-1">
                <button
                  onClick={handleHangUp}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <div className="text-[11px] font-bold text-slate-400">Recusar</div>
              </div>

              <div className="text-center space-y-1">
                <button
                  onClick={handleAnswerCall}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 animate-bounce cursor-pointer"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <div className="text-[11px] font-bold text-emerald-400">Atender Simulação</div>
              </div>
            </div>
          ) : callState === "connected" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    isMuted ? "bg-amber-500/20 text-amber-300" : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="text-[10px]">{isMuted ? "Mudo" : "Microfone"}</span>
                </button>

                <button
                  onClick={() => setShowKeypad(!showKeypad)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    showKeypad ? "bg-blue-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span className="text-[10px]">Teclado</span>
                </button>

                <button
                  onClick={() => {
                    const next = !isSpeakerOn;
                    setIsSpeakerOn(next);
                    if (!next && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    } else if (next) {
                      speakCurrentScript(currentDialogueIndex);
                    }
                  }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    isSpeakerOn ? "bg-blue-500/20 text-blue-300" : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span className="text-[10px]">{isSpeakerOn ? "Viva-Voz" : "Mudo"}</span>
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleHangUp}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-2">
              <p className="text-xs text-slate-400">
                Você encerrou a chamada simulada. Em situações reais, sempre desligue e ligue no número do verso do seu cartão!
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setCallState("ringing");
                    setCallDuration(0);
                    setCurrentDialogueIndex(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Testar Novamente</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
