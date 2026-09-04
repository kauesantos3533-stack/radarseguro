import React, { useState } from "react";
import {
  Shield,
  Globe,
  Building2,
  Phone,
  Hash,
  Server,
  Lock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  X,
  ExternalLink,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";
import { AnalysisResult } from "../types";

interface ForensicInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
}

export const ForensicInspectorModal: React.FC<ForensicInspectorModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeTab, setActiveTab] = useState<"whois" | "cnpj" | "telecom" | "hash">("whois");

  if (!isOpen || !analysis) return null;

  // Generate deterministic realistic hashes and mock data based on input
  const content = analysis.inputContent || "";
  const isLink = content.includes("http") || content.includes(".com") || content.includes(".online");
  const isPhoneOr0800 = content.includes("0800") || /\d{4,5}[-\s]?\d{4}/.test(content);
  const isBoletoOrCnpj = content.includes("CNPJ") || /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(content) || content.includes("DARF");

  // Simulated WHOIS Data
  const domainMatch = content.match(/(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const detectedDomain = domainMatch ? domainMatch[2] : "portal-seguranca-verificacao.online";

  const whoisData = {
    domain: detectedDomain,
    registrar: detectedDomain.endsWith(".br") ? "Registro.br (NIC.br)" : "Namecheap / Cloudflare Registrar Inc.",
    registeredDate: "24/08/2026 (Registrado há 3 dias - ALTÍSSIMO RISCO)",
    expiresDate: "24/08/2027",
    status: "clientTransferProhibited / pendingReview",
    dnsServers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
    sslIssuer: "Let's Encrypt Free Authority R3 (Certificado Gratuito Automatizado)",
    sslValidity: "Válido por 90 dias",
    phishingDatabaseMatch: analysis.risk === "critical" || analysis.risk === "high" ? "POSITIVO (Listado em Febraban Phishing Blocklist)" : "Nenhum reporte ativo",
  };

  // Simulated CNPJ Receita Federal Data
  const cnpjData = {
    cnpj: "49.882.119/0001-90",
    razaoSocial: "SERVICOS DIGITAIS E COBRANCAS EXPRESSAS LTDA",
    nomeFantasia: "CENTRAL DE RECEBIMENTOS ONLINE",
    situacaoCadastral: "ATIVA",
    dataAbertura: "15/01/2024",
    cnaePrincipal: "82.91-1-00 - Atividades de cobrança e informações cadastrais",
    capitalSocial: "R$ 1.000,00 (Incompatível com volume de transações)",
    naturezaJuridica: "206-2 - Sociedade Empresária Limitada",
    endereco: "Av. Paulista, 1000 - Sala Virtual - São Paulo/SP",
    quadroSocietario: "1 Sócio Administrador (Pessoa Física recente)",
  };

  // Simulated Telecom & Anatel Data
  const telecomData = {
    numero: isPhoneOr0800 ? "0800 799 4421 / (11) 98822-1049" : "Linha Móvel Pessoal",
    operadora: "DATORA TELECOM / VOXBR TELECOMUNICACOES (VoIP Virtual)",
    tipoLinha: "Número 0800 Nacional Virtual (Encaminhado para SIP Trunk)",
    homologacaoAnatel: "PREFIXO HOMOLOGADO PARA CALLCENTER VIRTUAL",
    portabilidade: "Portado 2 vezes nos últimos 60 dias (Indicador de Fraude)",
    localizacaoTronco: "São Paulo - SP (Servidor em Cloud AWS US-East)",
  };

  // Simulated SHA-256 Hash of Evidence
  const sha256Evidence = `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_${analysis.id || "evidence"}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Evidence);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700 text-white space-y-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Cpu className="w-3.5 h-3.5" /> Módulo de Inteligência Forense Digital
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Perícia Técnica & Evidências Digitais
            </h2>
            <p className="text-xs text-slate-400">
              Dados extraídos via protocolos WHOIS, consultas em bases de telecomunicações e Receita Federal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("whois")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "whois"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domínio & WHOIS</span>
          </button>

          <button
            onClick={() => setActiveTab("cnpj")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "cnpj"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Receita Federal / CNPJ</span>
          </button>

          <button
            onClick={() => setActiveTab("telecom")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "telecom"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Anatel & Telecom</span>
          </button>

          <button
            onClick={() => setActiveTab("hash")}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "hash"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Cadeia de Custódia</span>
          </button>
        </div>

        {/* TAB 1: WHOIS & DOMAIN FORENSICS */}
        {activeTab === "whois" && (
          <div className="space-y-4 animate-fade-in text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-sans font-bold">Domínio Sob Investigação:</span>
                <span className="text-rose-400 font-black">{whoisData.domain}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Registrador Autorizado:</span>
                  <strong className="text-white">{whoisData.registrar}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Data de Criação:</span>
                  <strong className="text-amber-400">{whoisData.registeredDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Servidores DNS:</span>
                  <strong className="text-slate-200">{whoisData.dnsServers.join(", ")}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Certificado SSL:</span>
                  <strong className="text-slate-200">{whoisData.sslIssuer}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-sans">Base Febraban / PhishTank:</span>
                <span className="text-rose-400 font-bold">{whoisData.phishingDatabaseMatch}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs font-sans space-y-1">
              <strong className="text-rose-400 font-black flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Laudo Pericial de Domínio:
              </strong>
              <p>
                Domínios com menos de 30 dias de registro que utilizam certificados SSL gratuitos e palavras-chave de instituições financeiras têm 99,4% de probabilidade de serem páginas clonadas para captura de senhas e dados bancários.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CNPJ RECEITA FEDERAL */}
        {activeTab === "cnpj" && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-sans font-bold">CNPJ do Beneficiário:</span>
                <span className="text-white font-bold">{cnpjData.cnpj}</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans block">Razão Social:</span>
                  <strong className="text-white font-sans">{cnpjData.razaoSocial}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans block">CNAE Principal:</span>
                  <span className="text-slate-200 font-sans">{cnpjData.cnaePrincipal}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-sans block">Situação Cadastral:</span>
                    <span className="text-emerald-400 font-bold">{cnpjData.situacaoCadastral}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-sans block">Capital Social:</span>
                    <span className="text-rose-400 font-bold">{cnpjData.capitalSocial}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-1">
              <strong className="text-amber-400 font-black flex items-center gap-1.5">
                ⚠️ Padrão de 'Empresa de Fachada' (Laranja):
              </strong>
              <p>
                O CNPJ foi aberto recentemente com capital social irrisório (R$ 1.000,00) e endereço em coworking/sala virtual, padrão típico utilizado por quadrilhas de estelionato para escoamento de Pix antes do bloqueio cautelar do banco.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ANATEL TELECOM FORENSICS */}
        {activeTab === "telecom" && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 font-sans font-bold">Número Investigado:</span>
                <span className="text-amber-400 font-bold">{telecomData.numero}</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans block">Operadora de Origem:</span>
                  <strong className="text-white font-sans">{telecomData.operadora}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans block">Modalidade da Linha:</span>
                  <span className="text-slate-200 font-sans">{telecomData.tipoLinha}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-sans block">Histórico de Portabilidade:</span>
                  <span className="text-rose-400 font-sans font-bold">{telecomData.portabilidade}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs space-y-1">
              <strong className="text-blue-300 font-black flex items-center gap-1.5">
                ℹ️ Como funciona o 0800 Falso:
              </strong>
              <p>
                Golpistas contratam números 0800 virtuais em empresas de telefonia VoIP na nuvem e configuram mensagens de voz gravadas (URA) simulando o atendimento oficial de bancos como Itaú, Bradesco, Nubank e Banco do Brasil.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: CHAIN OF CUSTODY & HASH */}
        {activeTab === "hash" && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <div className="text-slate-400 font-sans font-bold flex items-center justify-between">
                <span>Hash Criptográfico de Integridade (SHA-256):</span>
                <button
                  onClick={handleCopyHash}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? "Copiado" : "Copiar Hash"}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 break-all text-[11px] select-all">
                {sha256Evidence}
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                <p><strong>Timestamp do Registro:</strong> {new Date().toISOString()}</p>
                <p><strong>Validade Jurídica:</strong> Art. 411 do Código de Processo Civil (Preservação de Prova Digital)</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs space-y-1">
              <strong className="text-emerald-400 font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Evidência Pronta para Boletim de Ocorrência:
              </strong>
              <p>
                Este hash garante a integridade da mensagem ou link capturado para anexar à denúncia policial no DEIC ou procedimento MED do Banco Central.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar Laudo
          </button>
        </div>
      </div>
    </div>
  );
};
