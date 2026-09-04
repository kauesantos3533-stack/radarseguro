import React, { useState } from "react";
import {
  Skull,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Send,
  Lock,
  Search,
  CheckCircle2,
  Terminal,
  FileCode,
  Shield,
  Zap,
} from "lucide-react";

export const TakedownView: React.FC = () => {
  const [suspectUrl, setSuspectUrl] = useState("");
  const [suspectPhone, setSuspectPhone] = useState("");
  const [suspectPix, setSuspectPix] = useState("");
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"site" | "whatsapp" | "pix" | "laws">("site");

  const handleGenerateTakedown = () => {
    if (!suspectUrl && !suspectPhone && !suspectPix) {
      alert("Informe pelo menos um dado do golpista (Link, WhatsApp ou Chave Pix) para gerar o relatório de denúncia.");
      return;
    }

    const report = `[NOTIFICAÇÃO DE DENÚNCIA / ABUSE TAKEDOWN REPORT]
Destinatário: Equipe de Segurança da Informação & CSIRT / Abuse Team
Assunto: Denúncia de Infraestrutura de Fraude Eletrônica (Phishing / Estelionato)
Data: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}

1. RECURSOS IDENTIFICADOS EM ATIVIDADE ILÍCITA:
${suspectUrl ? `- URL / Domínio Malicioso (Phishing): ${suspectUrl}` : ""}
${suspectPhone ? `- Telefone / WhatsApp do Infrator: ${suspectPhone}` : ""}
${suspectPix ? `- Chave Pix / Conta Receptora: ${suspectPix}` : ""}

2. ENQUADRAMENTO JURÍDICO & IMPACTO:
A infraestrutura acima está sendo utilizada ativamente na prática de fraude eletrônica e engenharia social (Art. 171, §2º-A do Código Penal Brasileiro e Lei 14.155/2021), lesando cidadãos e simulando instituições financeiras/governamentais.

3. SOLICITAÇÃO DE PROVIDÊNCIAS IMEDIATAS (TAKEDOWN):
- Suspensão imediata da resolução de DNS e hospedagem do domínio malicioso;
- Bloqueio cautelar da conta / número telefônico por violação dos Termos de Uso e atividade criminosa;
- Preservação de logs de conexão e IPs de origem para disponibilização mediante ordem judicial da Polícia Civil (DCCIBER).

Denúncia estruturada via RadarSeguro.`;

    setGeneratedReport(report);
  };

  const handleCopy = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Warning Hero Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Segurança & Legislação
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Como Derrubar Golpistas de Forma Legal e Eficaz (Takedown)
            </h1>
            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
              "Hackear" dispositivos ou realizar ataques de retaliação (invasão) é <strong>crime previsto no Art. 154-A do Código Penal</strong> e expõe você a perigos. A forma real, inteligente e que os peritos em cibersegurança usam para destruir a operação dos golpistas é o <strong>Takedown Legal e Bloqueio de Infraestrutura</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex-shrink-0 text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            <div className="text-xs font-black text-amber-300 uppercase">Takedown Oficial</div>
            <div className="text-[11px] text-slate-300">Tira o site do ar no mundo todo</div>
          </div>
        </div>
      </div>

      {/* Why you shouldn't hack directly Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-3">
          <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <Skull className="w-4 h-4" /> Por que "Hackear de Volta" é Furada?
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-500">•</span>
              <span><strong>É Crime no Brasil:</strong> Invadir sistemas ou celulares (mesmo de bandidos) é crime pela Lei Carolina Dieckmann (Art. 154-A do CP), punível com prisão.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-500">•</span>
              <span><strong>Vítimas Inocentes:</strong> Golpistas usam contas bancárias de "laranjas", chips comprados com CPF vazado de idosos e servidores invadidos de terceiros. Você atacaria um inocente.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-rose-500">•</span>
              <span><strong>Risco de Revelar seu IP:</strong> Ao tentar invadir um site falso, o criminoso pode monitorar seus dados de rede e tentar retaliações contra você.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-3">
          <h2 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" /> O que Realmente Destrói o Golpe:
          </h2>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-500">✓</span>
              <span><strong>Takedown de Domínio:</strong> Denunciar no Google Safe Browsing e provedores faz com que navegadores e antivírus bloqueiem o site para 100% dos usuários.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-500">✓</span>
              <span><strong>Bloqueio de Chave Pix (MED):</strong> Notificar o Banco Central trava a conta receptora e impede o saque do dinheiro sujo.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-emerald-500">✓</span>
              <span><strong>DCCIBER / Polícia Civil:</strong> Permite que a polícia quebre o sigilo telemático e prenda a quadrilha por estelionato digital qualificado.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: "site", label: "Derrubar Site / Link Falso" },
          { id: "whatsapp", label: "Banir WhatsApp / Telegram" },
          { id: "pix", label: "Bloquear Chave Pix / Banco" },
          { id: "laws", label: "Canais Oficiais de Takedown" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedAction(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedAction === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Derrubar Site Falso */}
      {selectedAction === "site" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              Como Tirar um Site de Golpe do Ar em Poucas Horas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quando você denuncia um site falso nos órgãos globais de segurança, o link passa a exibir uma tela vermelha de aviso ("Site Enganoso") para todos os computadores e celulares do mundo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="https://safebrowsing.google.com/safebrowsing/report_phish/"
              target="_blank"
              rel="noreferrer noopener"
              className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 hover:border-blue-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                  Google Safe Browsing
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Bloqueia o site no Google Chrome, Android e na busca do Google instantaneamente.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-blue-600 dark:text-blue-400">Denunciar Link no Google &rarr;</div>
            </a>

            <a
              href="https://cert.br/notificacoes/"
              target="_blank"
              rel="noreferrer noopener"
              className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                  CERT.br / NIC.br
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Centro de Estudos e Resposta a Incidentes de Segurança para a Internet no Brasil.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Notificar CERT.br &rarr;</div>
            </a>

            <a
              href="https://phishtank.org/"
              target="_blank"
              rel="noreferrer noopener"
              className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="font-black text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
                  PhishTank & Antivírus
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Banco de dados global utilizado pela maioria dos navegadores (Firefox, Safari, Edge) e antivírus.
                </p>
              </div>
              <div className="mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Reportar no PhishTank &rarr;</div>
            </a>
          </div>

          {/* Generator Form */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
              Gerador de Notificação de Abuse / Takedown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Link / Domínio do Golpe
                </label>
                <input
                  type="text"
                  value={suspectUrl}
                  onChange={(e) => setSuspectUrl(e.target.value)}
                  placeholder="Ex: https://correios-taxa-libera.top"
                  className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Telefone / WhatsApp Usado
                </label>
                <input
                  type="text"
                  value={suspectPhone}
                  onChange={(e) => setSuspectPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Chave Pix do Criminoso
                </label>
                <input
                  type="text"
                  value={suspectPix}
                  onChange={(e) => setSuspectPix(e.target.value)}
                  placeholder="Ex: financeiro@pagamento-correio.xyz"
                  className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateTakedown}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FileCode className="w-4 h-4" />
              <span>Gerar Notificação Técnica de Takedown</span>
            </button>

            {generatedReport && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Texto de Notificação Pronto para Envio
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copiado!" : "Copiar"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {generatedReport}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Banir WhatsApp */}
      {selectedAction === "whatsapp" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Como Banir a Conta do Golpista no WhatsApp e Telegram
          </h3>
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-slate-900 dark:text-white text-sm block">
                1. Denúncia Direta no Aplicativo do WhatsApp (Mais Eficaz)
              </strong>
              <p>
                Abra a conversa do golpista &gt; Toque nos <strong>Três Pontos (Mais)</strong> &gt; Toque em <strong>"Denunciar"</strong> e marque a opção <strong>"Denunciar e Bloquear"</strong> (deixe marcada a opção de enviar as últimas 5 mensagens para análise). A IA do WhatsApp faz o banimento automático se detectar engenharia social.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-slate-900 dark:text-white text-sm block">
                2. Enviar E-mail para a Equipe de Suporte e Fraudes do WhatsApp
              </strong>
              <p>
                Envie um e-mail para <strong className="font-mono text-blue-600 dark:text-blue-400">support@whatsapp.com</strong> com o assunto <em>"Denúncia de Fraude / Falsa Identidade"</em> informando o número internacional do golpista no formato +55 (Ex: +55 11 98765-4321) anexando os prints das tentativas de extorsão.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bloquear Pix */}
      {selectedAction === "pix" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 space-y-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Como Inutilizar a Chave Pix e Congelar a Conta do Golpista
          </h3>
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-slate-900 dark:text-white text-sm block">
                1. Notificação de Infração Pix (Direto no seu Banco)
              </strong>
              <p>
                O Banco Central possui o sistema de <strong>Marcação de Chave Pix Fraudulenta</strong> (DICT). Quando múltiplos usuários denunciam uma chave ou abrem pedido de MED, a chave é carimbada com flag de fraude e os bancos passam a bloquear qualquer transferência para aquele CPF/CNPJ.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-slate-900 dark:text-white text-sm block">
                2. Denúncia no Banco Receptor
              </strong>
              <p>
                Ao identificar o banco de destino da chave Pix (ex: PagBank, Mercado Pago, Nubank), ligue para a ouvidoria da instituição informando que a conta está sendo utilizada para lavagem de dinheiro de estelionato eletrônico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Canais Oficiais */}
      {selectedAction === "laws" && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 space-y-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Órgãos de Repressão e Investigação de Crimes Cibernéticos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="font-black text-slate-900 dark:text-white mb-1">DCCIBER - Polícia Civil</div>
              <p className="text-slate-500 dark:text-slate-400">
                Divisão de Crimes Cibernéticos especializada em rastreamento de IP, sequestro de dados e quadrilhas de Pix.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="font-black text-slate-900 dark:text-white mb-1">SaferNet Brasil</div>
              <p className="text-slate-500 dark:text-slate-400">
                Central nacional de denúncias de crimes cibernéticos em cooperação com o Ministério Público Federal.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="font-black text-slate-900 dark:text-white mb-1">Disque Denúncia: 181</div>
              <p className="text-slate-500 dark:text-slate-400">
                Canal sigiloso e anônimo para denunciar centrais falsas de 0800 e endereços de cativeiro/golpe.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="font-black text-slate-900 dark:text-white mb-1">Banco Central do Brasil</div>
              <p className="text-slate-500 dark:text-slate-400">
                Canal 145 para registrar reclamações contra bancos que se recusam a instaurar o MED ou falham na segurança.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
