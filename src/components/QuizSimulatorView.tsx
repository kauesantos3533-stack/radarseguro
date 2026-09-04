import React, { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ChevronRight,
  PhoneCall,
  Smartphone,
} from "lucide-react";
import { QUIZ_QUESTIONS } from "../data/quizData";
import { saveQuizScore } from "../utils/storage";
import { RealisticDevicePreview } from "./RealisticDevicePreview";
import { PhoneCallSimulatorModal } from "./PhoneCallSimulatorModal";

export const QuizSimulatorView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<{ id: number; correct: boolean }[]>([]);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const handleAnswer = (isScamChosen: boolean) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(isScamChosen);

    const isCorrect = isScamChosen === currentQuestion.isScam;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswersHistory((prev) => [...prev, { id: currentQuestion.id, correct: isCorrect }]);
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
      const finalScorePct = Math.round(((score + (selectedAnswer === currentQuestion.isScam ? 0 : 0)) / QUIZ_QUESTIONS.length) * 100);
      saveQuizScore(finalScorePct);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
    setAnswersHistory([]);
  };

  const getRankBadge = () => {
    const pct = (score / QUIZ_QUESTIONS.length) * 100;
    if (pct >= 90) return { title: "🛡️ Sentinela Antifraude Especialista", color: "text-emerald-500", desc: "Excelente! Você possui um olhar clínico e dificilmente cairá em golpes virtuais." };
    if (pct >= 60) return { title: "⚡ Usuário Consciente", color: "text-blue-500", desc: "Bom resultado! Continue atento a detalhes como números 0800 em SMS e chaves Pix desconhecidas." };
    return { title: "⚠️ Atenção Necessária", color: "text-amber-500", desc: "Cuidado! Golpistas usam táticas sofisticadas. Pratique mais com o simulador e consulte o RadarSeguro sempre que tiver dúvidas." };
  };

  // Determine media preview type
  const previewType: "whatsapp" | "sms_lockscreen" | "boleto" | "pix_receipt" =
    currentQuestion.mediaType === "whatsapp"
      ? "whatsapp"
      : currentQuestion.mediaType === "receipt"
      ? "pix_receipt"
      : currentQuestion.mediaType === "email"
      ? "sms_lockscreen"
      : "sms_lockscreen";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
          <HelpCircle className="w-3.5 h-3.5" /> Simulador de Treinamento
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
          Você cairia nesse golpe?
        </h1>
        <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl mx-auto">
          Treine sua percepção analisando situações e mensagens reais do cotidiano brasileiro.
        </p>
      </div>

      {!isFinished ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Cenário {currentIndex + 1} de {QUIZ_QUESTIONS.length}</span>
            <span>Pontuação Atual: {score} acerto(s)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Scenario Context Badge and Visual Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span>Canal:</span> <strong>{currentQuestion.sender}</strong>
            </div>

            <div className="flex items-center gap-2">
              {currentQuestion.messageText.includes("0800") && (
                <button
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Simular Ligação 0800</span>
                </button>
              )}

              <button
                onClick={() => setShowDeviceFrame(!showDeviceFrame)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showDeviceFrame
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{showDeviceFrame ? "Modo Celular Realista" : "Modo Texto"}</span>
              </button>
            </div>
          </div>

          {/* Realistic Device Screen or Text Message */}
          {showDeviceFrame ? (
            <div className="py-2 animate-fade-in">
              <RealisticDevicePreview
                type={previewType}
                sender={currentQuestion.sender}
                content={currentQuestion.messageText}
                isSuspicious={currentQuestion.isScam}
                extraMeta={{
                  bankName: "Banco Itaú / Mercado Livre",
                  amount: "R$ 4.290,00",
                  beneficiary: "CENTRAL DE COMPRAS ONLINE",
                  cnpj: "49.882.119/0001-90",
                  barcode: "23793.38128 60000.123456 1 91230000028990",
                }}
              />
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 relative">
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                Mensagem Recebida:
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                "{currentQuestion.messageText}"
              </p>
            </div>
          )}

          {/* Choice Buttons */}
          {selectedAnswer === null ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleAnswer(true)}
                className="py-4 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>É GOLPE / SUSPEITO!</span>
              </button>

              <button
                onClick={() => handleAnswer(false)}
                className="py-4 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>PARECE LEGÍTIMO / SEGURO</span>
              </button>
            </div>
          ) : (
            /* Answer explanation card */
            <div className="space-y-4 pt-2 animate-fade-in">
              <div
                className={`p-5 rounded-2xl border ${
                  selectedAnswer === currentQuestion.isScam
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2 font-black text-base mb-2">
                  {selectedAnswer === currentQuestion.isScam ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span>Você Acertou! {currentQuestion.isScam ? "É um golpe." : "É uma mensagem legítima."}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-rose-600" />
                      <span>Você Errou! {currentQuestion.isScam ? "Esta mensagem é um golpe perigoso." : "Esta mensagem era legítima."}</span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed mb-3">
                  {currentQuestion.explanation}
                </p>

                {currentQuestion.redFlags.length > 0 && (
                  <div className="text-xs space-y-1 font-medium">
                    <strong className="block font-bold mb-1">Principais indícios:</strong>
                    {currentQuestion.redFlags.map((flag, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>{currentIndex < QUIZ_QUESTIONS.length - 1 ? "Próximo Cenário" : "Ver Meu Resultado Final"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {score} de {QUIZ_QUESTIONS.length} Acertos ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
            </div>
            <div className={`text-lg font-extrabold ${getRankBadge().color}`}>
              {getRankBadge().title}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {getRankBadge().desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
            Dica do RadarSeguro: Na dúvida, NUNCA utilize links ou telefones enviados por terceiros. Entre no aplicativo do seu banco ou consulte o canal oficial.
          </div>

          <button
            onClick={handleRestart}
            className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refazer Simulação</span>
          </button>
        </div>
      )}

      {/* Interactive Phone Call Modal */}
      <PhoneCallSimulatorModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        callerName={currentQuestion?.scamName || "Central de Segurança Bancária"}
        callerNumber="0800 591 9920"
        scamScenario={currentQuestion?.messageText}
      />
    </div>
  );
};
