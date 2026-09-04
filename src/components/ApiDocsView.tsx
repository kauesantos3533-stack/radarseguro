import React, { useState } from "react";
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  Zap,
  Shield,
  Key,
  Download,
  ExternalLink,
  Sparkles,
  Server,
  Layers,
  FileCode,
  FileText,
  Search,
  Building,
  CreditCard,
  Link as LinkIcon,
  PhoneCall,
  Mic,
  Activity,
  ChevronRight,
  Send,
  RefreshCw,
} from "lucide-react";

interface ApiEndpoint {
  id: string;
  method: "POST" | "GET";
  path: string;
  title: string;
  category: "Inteligência Artificial" | "Validação & Receita" | "Forense & Rede" | "Sistema";
  description: string;
  defaultPayload: string;
  presets?: { name: string; payload: string }[];
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    id: "analyze",
    method: "POST",
    path: "/api/analyze",
    title: "Análise Pericial Completa (IA + Heurística)",
    category: "Inteligência Artificial",
    description: "Analisa mensagens, textos de SMS, WhatsApp, links, chaves Pix e comprovantes bancários (OCR).",
    defaultPayload: JSON.stringify(
      {
        text: "BANCO INTER: Compra aprovada de R$ 4.250,00 na AMAZON BRASIL em 28/08. Caso nao reconheca, ligue urgente para 0800 799 4421 para cancelar.",
        type: "message",
      },
      null,
      2
    ),
    presets: [
      {
        name: "SMS Falsa Central (0800)",
        payload: JSON.stringify(
          {
            text: "BANCO INTER: Compra aprovada de R$ 4.250,00 na AMAZON BRASIL em 28/08. Caso nao reconheca, ligue urgente para 0800 799 4421 para cancelar.",
            type: "message",
          },
          null,
          2
        ),
      },
      {
        name: "WhatsApp Falso Parente",
        payload: JSON.stringify(
          {
            text: "Oi mãe, troquei de número porque meu chip estragou. Preciso pagar uma fatura urgente de R$ 1.650 hoje, consegue me mandar no Pix?",
            type: "message",
          },
          null,
          2
        ),
      },
      {
        name: "Golpe da Tarefa / Shopee",
        payload: JSON.stringify(
          {
            text: "Trabalhe 20 min por dia avaliando produtos e ganhe R$ 300 a R$ 800 diariamente. Chame no Telegram para receber sua comissão.",
            type: "message",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "check_cnpj",
    method: "POST",
    path: "/api/check-cnpj",
    title: "Consulta CNPJ & Risco Cadastral na Receita",
    category: "Validação & Receita",
    description: "Consulta dados cadastrais oficiais na Receita Federal e calcula a pontuação de risco (idade da empresa, capital social, MEI).",
    defaultPayload: JSON.stringify(
      {
        cnpj: "49882119000190",
      },
      null,
      2
    ),
    presets: [
      {
        name: "CNPJ 49.882.119/0001-90",
        payload: JSON.stringify({ cnpj: "49882119000190" }, null, 2),
      },
      {
        name: "CNPJ 00.000.000/0001-91 (Banco do Brasil)",
        payload: JSON.stringify({ cnpj: "00000000000191" }, null, 2),
      },
    ],
  },
  {
    id: "check_pix",
    method: "POST",
    path: "/api/check-pix",
    title: "Validador e Perícia de Chave Pix / QR Code",
    category: "Forense & Rede",
    description: "Identifica o tipo de chave (CPF, CNPJ, EVP, E-mail, Telefone) ou decodifica payload Pix Copia e Cola padrão EMV Bacen.",
    defaultPayload: JSON.stringify(
      {
        pixKey: "4a82b9c1-7f3e-4c12-9843-02f89e4190ba",
      },
      null,
      2
    ),
    presets: [
      {
        name: "Chave Aleatória (EVP)",
        payload: JSON.stringify({ pixKey: "4a82b9c1-7f3e-4c12-9843-02f89e4190ba" }, null, 2),
      },
      {
        name: "E-mail Suspeito",
        payload: JSON.stringify({ pixKey: "financeiro.cancelamento@suporte-bancario.xyz" }, null, 2),
      },
      {
        name: "Payload Copia e Cola",
        payload: JSON.stringify({ pixKey: "00020126580014br.gov.bcb.pix01364a82b9c1-7f3e-4c12-9843-02f89e4190ba5204000053039865802BR5915RADARSEGURO LTDA6009SAO PAULO62070503***6304E8A2" }, null, 2),
      },
    ],
  },
  {
    id: "check_link",
    method: "POST",
    path: "/api/check-link",
    title: "Detector de Phishing, Domínio & Typosquatting",
    category: "Forense & Rede",
    description: "Inspeciona segurança do domínio, extensões de alto risco (.xyz, .top), impostura de bancos brasileiros e certificado SSL.",
    defaultPayload: JSON.stringify(
      {
        url: "https://rastreio-correios-taxa-alfandega.xyz/minhas-importacoes",
      },
      null,
      2
    ),
    presets: [
      {
        name: "Phishing Falsa Taxa Correios",
        payload: JSON.stringify({ url: "https://rastreio-correios-taxa-alfandega.xyz/minhas-importacoes" }, null, 2),
      },
      {
        name: "Impostura Banco Bradesco",
        payload: JSON.stringify({ url: "https://bradesco-atualizacao-seguranca.top/login" }, null, 2),
      },
      {
        name: "Portal Oficial Legítimo",
        payload: JSON.stringify({ url: "https://www.nubank.com.br/seguranca" }, null, 2),
      },
    ],
  },
  {
    id: "check_phone",
    method: "POST",
    path: "/api/check-phone",
    title: "Análise de 0800 & Falsas Centrais Telefônicas",
    category: "Forense & Rede",
    description: "Verifica se o número segue padrões de URA clandestina, operadoras virtuais descartáveis ou spoofing de bina.",
    defaultPayload: JSON.stringify(
      {
        phone: "0800 799 4421",
      },
      null,
      2
    ),
  },
  {
    id: "analyze_audio",
    method: "POST",
    path: "/api/analyze-audio",
    title: "Perícia de Voz & Vishing Telefônico (IA)",
    category: "Inteligência Artificial",
    description: "Transcreve e analisa gravações telefônicas ou notas de áudio do WhatsApp buscando técnicas de persuasão e engenharia social.",
    defaultPayload: JSON.stringify(
      {
        transcript: "Alô senhor, sou o Carlos da central de prevenção a fraudes do seu banco. Foi detectada uma transferência suspeita de 5 mil reais. Para cancelar, preciso que o senhor baixe o aplicativo AnyDesk e confirme seu código.",
      },
      null,
      2
    ),
  },
  {
    id: "scams_feed",
    method: "GET",
    path: "/api/scams/feed",
    title: "Feed Público de Ameaças em Tempo Real",
    category: "Sistema",
    description: "Retorna a lista atualizada das fraudes digitais de maior circulação no Brasil com métricas de severidade e tendência.",
    defaultPayload: "",
  },
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    title: "Status da API & Modelos Ativos",
    category: "Sistema",
    description: "Verifica disponibilidade, latência, tempo de atividade (uptime) e catálogo de rotas.",
    defaultPayload: "",
  },
];

export const ApiDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState<string>(selectedEndpoint.defaultPayload);
  const [codeLanguage, setCodeLanguage] = useState<"curl" | "javascript" | "python" | "php">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Live Playground Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseDuration, setResponseDuration] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);

  const sandboxApiKey = "radar_live_8fbc0366fbe53c0fe46ab4_sec";

  const handleSelectEndpoint = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestPayload(endpoint.defaultPayload);
    setResponseBody(null);
    setResponseStatus(null);
    setResponseDuration(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sandboxApiKey}`,
        },
      };

      if (selectedEndpoint.method === "POST" && requestPayload.trim()) {
        options.body = requestPayload;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseBody(JSON.stringify(json, null, 2));
    } catch (err: any) {
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: "Falha na conexão", details: err.message }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const generateSnippet = () => {
    const fullUrl = window.location.origin + selectedEndpoint.path;

    if (codeLanguage === "curl") {
      if (selectedEndpoint.method === "GET") {
        return `curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer ${sandboxApiKey}"`;
      }
      return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${sandboxApiKey}" \\
  -d '${requestPayload.replace(/\n\s*/g, " ")}'`;
    }

    if (codeLanguage === "javascript") {
      if (selectedEndpoint.method === "GET") {
        return `// RadarSeguro API Client (JavaScript / TypeScript)
const response = await fetch("${fullUrl}", {
  method: "GET",
  headers: {
    "Authorization": "Bearer ${sandboxApiKey}"
  }
});
const data = await response.json();
console.log(data);`;
      }
      return `// RadarSeguro API Client (JavaScript / TypeScript)
const payload = ${requestPayload || "{}"};

const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${sandboxApiKey}"
  },
  body: JSON.stringify(payload)
});

const result = await response.json();
console.log(result);`;
    }

    if (codeLanguage === "python") {
      if (selectedEndpoint.method === "GET") {
        return `# RadarSeguro Python SDK
import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${sandboxApiKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
      }
      return `# RadarSeguro Python SDK
import requests
import json

url = "${fullUrl}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${sandboxApiKey}"
}
payload = ${requestPayload || "{}"}

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(f"Risk Score: {data.get('riskScore')}")
print(data)`;
    }

    if (codeLanguage === "php") {
      return `<?php
// RadarSeguro PHP Client
$ch = curl_init("${fullUrl}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ${sandboxApiKey}'
]);
${
  selectedEndpoint.method === "POST"
    ? `curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, '${requestPayload.replace(/\n\s*/g, " ")}');`
    : ""
}

$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response, true);
print_r($result);
?>`;
    }

    return "";
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(sandboxApiKey);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleDownloadOpenApi = () => {
    window.open("/api/docs", "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
              <Code className="w-3.5 h-3.5" /> Portal do Desenvolvedor & API REST
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              RadarSeguro Developer API Suite
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed">
              Integre inteligência antifraude em tempo real ao seu Bot de WhatsApp, ERP, CRM, checkout ou aplicativo. Perícia de mensagens, links, CNPJs e chaves Pix com alta precisão.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadOpenApi}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Baixar OpenAPI 3.0 (JSON)</span>
            </button>
          </div>
        </div>

        {/* API Credentials Box */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-blue-200 font-medium">Chave de Acesso / Bearer Sandbox:</div>
              <div className="font-mono text-xs text-white font-bold bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 inline-block mt-0.5">
                {sandboxApiKey}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyToken}
            className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToken ? "Chave Copiada!" : "Copiar Token"}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Endpoints Navigation */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Endpoints Disponíveis
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {ENDPOINTS.length} Rotas
            </span>
          </div>

          <div className="space-y-1.5">
            {ENDPOINTS.map((endpoint) => {
              const isSelected = selectedEndpoint.id === endpoint.id;
              return (
                <button
                  key={endpoint.id}
                  onClick={() => handleSelectEndpoint(endpoint)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1 border ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-sm"
                      : "bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        endpoint.method === "POST"
                          ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{endpoint.category}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                    {endpoint.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {endpoint.path}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section: Interactive Request Runner & Code Snippets */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Endpoint Details & Interactive Tester */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg ${
                      selectedEndpoint.method === "POST"
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedEndpoint.description}
                </p>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isLoading ? "Executando..." : "Executar Chamada"}</span>
              </button>
            </div>

            {/* Presets Bar */}
            {selectedEndpoint.presets && selectedEndpoint.presets.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Exemplos rápidos de payload:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedEndpoint.presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRequestPayload(preset.payload)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body Editor (for POST) */}
            {selectedEndpoint.method === "POST" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Corpo da Requisição (JSON Payload):</span>
                  <span className="text-[11px] text-slate-400 font-mono">application/json</span>
                </div>
                <textarea
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  rows={6}
                  className="w-full font-mono text-xs p-4 rounded-2xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
                  placeholder='{"chave": "valor"}'
                />
              </div>
            )}

            {/* Live Response Panel */}
            {responseBody !== null && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" /> Resposta da API (Live Output):
                  </span>
                  <div className="flex items-center gap-2">
                    {responseStatus !== null && (
                      <span
                        className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                          responseStatus >= 200 && responseStatus < 300
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        HTTP {responseStatus}
                      </span>
                    )}
                    {responseDuration !== null && (
                      <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {responseDuration} ms
                      </span>
                    )}
                  </div>
                </div>
                <pre className="font-mono text-xs p-4 rounded-2xl bg-slate-950 text-blue-300 border border-slate-800 overflow-x-auto max-h-96 leading-relaxed">
                  {responseBody}
                </pre>
              </div>
            )}
          </div>

          {/* Code Snippets Generator */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" /> Código de Integração Pronto
              </h3>

              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
                {(["curl", "javascript", "python", "php"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCodeLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      codeLanguage === lang
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="font-mono text-xs p-4 rounded-2xl bg-slate-950 text-amber-300 border border-slate-800 overflow-x-auto leading-relaxed">
                {generateSnippet()}
              </pre>

              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
