import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  ExternalLink,
  Radio,
  Zap,
  Info,
  Clock,
  ThumbsUp,
  AlertTriangle,
  MessageSquareText,
  PhoneCall,
  Lock,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  suggestions?: string[];
  quickAction?: string;
  isStreaming?: boolean;
}

interface AiAssistantChatViewProps {
  onNavigateTab?: (tab: string) => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: "msg-init-1",
  role: "model",
  text: `👋 **Olá! Sou o Assistente Virtual Inteligente 24h do RadarSeguro.**\n\nEstou aqui para responder seus clientes e usuários automaticamente com orientações periciais sobre fraudes, golpes do Pix, falsas centrais telefônicas, WhatsApp e medidas de emergência (MED Bacen e Boletim de Ocorrência).\n\n**Como posso te ajudar agora?**`,
  timestamp: "Agora",
  suggestions: [
    "🚨 Caí num golpe do Pix agora, o que fazer?",
    "📱 Recebi um SMS com 0800 informando compra suspeita",
    "💬 Alguém com foto de parente pediu dinheiro no WhatsApp",
    "🏛️ Como registrar Boletim de Ocorrência pela internet?",
  ],
};

export const AiAssistantChatView: React.FC<AiAssistantChatViewProps> = ({
  onNavigateTab,
  isFloating = false,
  onCloseFloating,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("radarseguro_ai_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [INITIAL_GREETING];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"standard" | "emergency" | "triage">("standard");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Persist chat to local storage
  useEffect(() => {
    localStorage.setItem("radarseguro_ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Speak text using browser speech synthesis
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/https?:\/\/[^\s]+/g, "link")
      .slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Map message history for server API
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          currentMessage: text,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com a IA");
      }

      const data = await res.json();

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: "model",
        text: data.reply || "Ocorreu um erro ao processar a resposta. Por favor, tente novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        suggestions: data.suggestions,
        quickAction: data.quickAction,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (voiceEnabled) {
        speakText(botMsg.text);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: "model",
        text: "Desculpe, tive uma instabilidade temporária. Você pode tentar novamente ou navegar pelo menu de socorro rápido.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        suggestions: [
          "Como recuperar Pix pelo MED?",
          "Fui vítima de golpe",
          "Verificar SMS suspeito",
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Deseja realmente limpar o histórico da conversa?")) {
      setMessages([INITIAL_GREETING]);
      localStorage.removeItem("radarseguro_ai_chat_history");
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickAction = (action?: string) => {
    if (!action || !onNavigateTab) return;
    if (action === "victim") onNavigateTab("victim");
    else if (action === "analyze") onNavigateTab("analyze");
    else if (action === "map") onNavigateTab("map");
    else if (action === "library") onNavigateTab("library");
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all ${
        isFloating
          ? "w-full h-full rounded-2xl"
          : "max-w-4xl mx-auto rounded-3xl min-h-[640px] h-[780px]"
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-blue-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md border border-blue-400/30">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                Atendimento Automático IA 24h
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-400/30 uppercase tracking-wider hidden xs:inline-block">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Respostas instantâneas com Inteligência Artificial • Gemini 3.7
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
            }}
            title={voiceEnabled ? "Desativar Leitura por Voz" : "Ativar Leitura por Voz"}
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              voiceEnabled
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-white"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            title="Limpar Conversa"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close Floating Modal if applicable */}
          {isFloating && onCloseFloating && (
            <button
              onClick={onCloseFloating}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-900/60 text-slate-400 hover:text-white transition-all text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Preset Quick Triage Bar */}
      {!isFloating && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none flex-shrink-0 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Tópicos Rápidos:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendMessage("O que é o MED do Banco Central e como pedir?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold whitespace-nowrap text-[11px] transition-colors"
            >
              💸 Como funciona o MED (Pix)
            </button>
            <button
              onClick={() => handleSendMessage("Recebi SMS de compra com telefone 0800, é golpe?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold whitespace-nowrap text-[11px] transition-colors"
            >
              📞 Golpe do 0800 Falso
            </button>
            <button
              onClick={() => handleSendMessage("Como saber se um boleto bancário é falso antes de pagar?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold whitespace-nowrap text-[11px] transition-colors"
            >
              📄 Verificar Boleto
            </button>
            <button
              onClick={() => handleSendMessage("Como registrar B.O. pela internet para crimes cibernéticos?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-blue-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold whitespace-nowrap text-[11px] transition-colors"
            >
              👮 Abrir B.O. Online
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${
                  isUser
                    ? "bg-blue-600"
                    : "bg-gradient-to-tr from-slate-900 to-blue-900 border border-blue-400/40"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>

              {/* Message Bubble Body */}
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none font-medium"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="whitespace-pre-line prose dark:prose-invert max-w-none text-xs sm:text-[13px] leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Message Footer Action Tools */}
                  {!isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3" /> {msg.timestamp}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-blue-500 flex items-center gap-1 transition-colors"
                          title="Copiar mensagem"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px]">{copiedId === msg.id ? "Copiado!" : "Copiar"}</span>
                        </button>
                        {voiceEnabled && (
                          <button
                            onClick={() => speakText(msg.text)}
                            className="hover:text-blue-500 flex items-center gap-1 transition-colors"
                            title="Ouvir novamente"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action Button if attached */}
                {!isUser && msg.quickAction && onNavigateTab && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleQuickAction(msg.quickAction)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800 shadow-sm transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>
                        {msg.quickAction === "victim"
                          ? "Abrir Gerador de Dossiê MED (SOS Vítima)"
                          : msg.quickAction === "analyze"
                          ? "Abrir Verificador de Mensagens & Prints"
                          : msg.quickAction === "map"
                          ? "Ver Delegacias Cibernéticas no Mapa"
                          : "Acessar Guia de Golpes"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Follow-up Suggestion Chips */}
                {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium transition-all text-left flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-blue-900 border border-blue-400/40 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>O Assistente IA está redigindo a resposta para o cliente...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Footer */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite a dúvida ou mensagem do cliente para a IA responder..."
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-inner"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
              !inputMessage.trim() || isLoading
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-105"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Responder</span>
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" /> Atendimento criptografado e seguro
          </span>
          <span>IA treinada no ecossistema antifraude brasileiro (Bacen & Polícia Civil)</span>
        </div>
      </div>
    </div>
  );
};
