import { AnalysisResult, VictimDossierInput } from "../types";
import { db } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";

const HISTORY_KEY = "radarseguro_history";
const DOSSIER_DRAFTS_KEY = "radarseguro_dossier_drafts";
const STATS_KEY = "radarseguro_user_stats";
const FIREBASE_HISTORY_COLLECTION = "scam_analyses";
const FIREBASE_DOSSIERS_COLLECTION = "victim_dossiers";

export interface UserStats {
  totalScans: number;
  threatsDetected: number;
  safeScans: number;
  quizScore: number;
  quizCompleted: boolean;
}

export const SAMPLE_HISTORY_ITEMS: AnalysisResult[] = [
  {
    id: "hist-sample-1",
    timestamp: Date.now() - 1000 * 60 * 35, // 35 min ago
    inputContent: "BANCO INTER: Compra aprovada de R$ 4.250,00 na AMAZON BRASIL em 27/08. Caso nao reconheca, ligue urgente para 0800 799 4421 para cancelar.",
    type: "message",
    risk: "critical",
    riskScore: 98,
    title: "Tentativa de Golpe da Falsa Central Telefônica (0800 Falso)",
    scamCategory: "Falsa Central Bancária (0800)",
    summary: "Mensagem fraudulenta de engenharia social simulando alerta de compra inexistente para induzir a vítima a ligar para uma falsa central de atendimento criminosa.",
    redFlags: [
      "Número 0800 não registrado nos canais oficiais da instituição bancária",
      "Gatilho psicológico de urgência com valor alto para gerar pânico",
      "Erros sutis de grafia e ausência dos 4 últimos dígitos do cartão",
      "Bancos reais nunca solicitam ligação para 0800 enviado por SMS genérico",
    ],
    recommendations: [
      "NUNCA ligue para o número 0800 informado na mensagem.",
      "Consulte o extrato em tempo real pelo aplicativo oficial do seu banco.",
      "Bloqueie e denuncie o número remetente no seu celular.",
    ],
    explanation: "Os criminosos alugam linhas 0800 e utilizam URA com voz automatizada simulando bancos reais para roubar senhas ou induzir transferências Pix.",
    officialChannels: [
      { name: "Banco Inter SAC Oficial", contact: "0800 940 9999", note: "Canal oficial 24h" },
      { name: "Ouvidoria Banco Central", contact: "145", note: "Canal regulatório" },
    ],
    actionableSteps: [
      "Não discar o 0800 da mensagem",
      "Ligar no número impresso no verso do seu cartão",
      "Registrar denúncia na plataforma",
    ],
    analyzedWithAi: true,
  },
  {
    id: "hist-sample-2",
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    inputContent: "Oi pai, troquei de numero porque meu chip quebrou. Salva esse novo contato ai. Preciso pagar uma conta urgente hoje antes das 17h, consegue me mandar R$ 1.800 no Pix? Amanha te devolvo.",
    type: "message",
    risk: "critical",
    riskScore: 96,
    title: "Golpe do WhatsApp (Falso Parente / Novo Número)",
    scamCategory: "Falso Parente / WhatsApp",
    summary: "Criminoso utilizando foto de perfil de familiar e número novo para simular emergência financeira imediata.",
    redFlags: [
      "Uso da justificativa de chip quebrado ou celular que molhou",
      "Pedido urgente de transferência Pix para conta de terceiro desconhecido",
      "Recusa ou desculpa para não atender chamadas normais de voz ou vídeo",
    ],
    recommendations: [
      "NUNCA faça transferência para chave Pix em nome de terceiros.",
      "Faça uma chamada de voz para o número antigo do seu familiar imediatamente.",
      "Denuncie o perfil dentro do próprio WhatsApp.",
    ],
    explanation: "Golpe comum de engenharia social onde fotos públicas de redes sociais são baixadas e usadas em chips pré-pagos descartáveis.",
    officialChannels: [
      { name: "Denúncia WhatsApp", contact: "support@whatsapp.com", note: "Canal de suporte" },
    ],
    actionableSteps: [
      "Telefonar para o número antigo do familiar",
      "Exigir chamada de vídeo",
      "Não efetuar nenhum Pix",
    ],
    analyzedWithAi: true,
  },
  {
    id: "hist-sample-3",
    timestamp: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    inputContent: "DARF SIMPLES NACIONAL / GUIA MEI - Pagamento de Taxa Anual Associativa Obrigatória R$ 289,90 - Chave Pix CNPJ: 49.882.119/0001-90",
    type: "boleto",
    risk: "high",
    riskScore: 88,
    title: "Cobrança Indevida / Golpe da Falsa Guia de Tributos MEI",
    scamCategory: "Boleto Falso & Cobrança Indevida",
    summary: "Cobrança fraudulenta enviada a microempreendedores individuais simulando guia governamental obrigatória.",
    redFlags: [
      "Beneficiário final é uma associação privada e não a Receita Federal do Brasil",
      "A única guia obrigatória do MEI é o DAS gerado no portal oficial gov.br",
      "Uso de termos ameaçadores como cancelamento do CNPJ",
    ],
    recommendations: [
      "Desconsidere e não efetue o pagamento.",
      "Gere o DAS exclusivamente no Portal do Empreendedor (gov.br).",
    ],
    explanation: "Empresas e estelionatários capturam dados públicos de abertura de CNPJ na Receita e disparam cobranças fictícias.",
    officialChannels: [
      { name: "Portal do Empreendedor", contact: "gov.br/mei", note: "Site oficial do Governo" },
    ],
    actionableSteps: [
      "Acessar pgmei no gov.br",
      "Ignorar e-mails de cobrança associativa",
    ],
    analyzedWithAi: true,
  },
  {
    id: "hist-sample-4",
    timestamp: Date.now() - 1000 * 60 * 60 * 36, // 36 hours ago
    inputContent: "https://www.nubank.com.br/seguranca/duplo-fator",
    type: "link",
    risk: "low",
    riskScore: 4,
    title: "Portal Oficial Verificado e Seguro (Nubank)",
    scamCategory: "Canal Oficial Verificado",
    summary: "Domínio corporativo legítimo da instituição financeira Nubank com certificado SSL válido.",
    redFlags: [],
    recommendations: [
      "Endereço autêntico e seguro para consulta.",
      "Mantenha sempre a verificação em 2 etapas ativada no app.",
    ],
    explanation: "O endereço analisado pertence diretamente aos servidores oficiais do Nubank no Brasil.",
    officialChannels: [
      { name: "Nubank Oficial", contact: "0800 608 6236", note: "Atendimento 24h" },
    ],
    actionableSteps: [
      "Navegar normalmente",
    ],
    analyzedWithAi: true,
  },
];

// Helper to push record asynchronously to Firebase Firestore
async function syncItemToFirestore(item: AnalysisResult): Promise<void> {
  try {
    if (!item.id) return;
    const docRef = doc(db, FIREBASE_HISTORY_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn("Firebase sync notice (offline or rule constraint):", err);
  }
}

// Helper to delete record from Firebase Firestore
async function deleteItemFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, FIREBASE_HISTORY_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firebase delete notice:", err);
  }
}

export function getHistory(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return SAMPLE_HISTORY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 0) {
      return [];
    }
    return parsed;
  } catch {
    return SAMPLE_HISTORY_ITEMS;
  }
}

export async function fetchHistoryFromFirebase(): Promise<AnalysisResult[] | null> {
  try {
    const q = query(collection(db, FIREBASE_HISTORY_COLLECTION), orderBy("timestamp", "desc"), limit(100));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items: AnalysisResult[] = [];
      snap.forEach((d) => {
        items.push(d.data() as AnalysisResult);
      });
      if (items.length > 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
        recalculateStats(items);
        return items;
      }
    }
    return null;
  } catch (err) {
    console.warn("Could not fetch remote Firebase history:", err);
    return null;
  }
}

export function saveToHistory(item: AnalysisResult): void {
  try {
    const current = getHistory();
    const newItem: AnalysisResult = {
      ...item,
      id: item.id || `scan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: item.timestamp || Date.now(),
    };
    // Keep max 100 items and avoid duplicate IDs
    const updated = [newItem, ...current.filter((h) => h.id !== newItem.id)].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    // Recalculate local stats
    recalculateStats(updated);

    // Sync to Cloud Firestore in background
    syncItemToFirestore(newItem);
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory();
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    recalculateStats(updated);

    // Delete in Firebase
    deleteItemFromFirestore(id);
  } catch (e) {
    console.error("Failed to delete history item", e);
  }
}

export function deleteMultipleHistoryItems(ids: string[]): void {
  try {
    const idSet = new Set(ids);
    const history = getHistory();
    const updated = history.filter((h) => !idSet.has(h.id || ""));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    recalculateStats(updated);

    // Delete from Firestore in parallel
    ids.forEach((id) => deleteItemFromFirestore(id));
  } catch (e) {
    console.error("Failed to delete multiple items", e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
    const stats: UserStats = {
      totalScans: 0,
      threatsDetected: 0,
      safeScans: 0,
      quizScore: 0,
      quizCompleted: false,
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to clear history", e);
  }
}

export function restoreSampleHistory(): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(SAMPLE_HISTORY_ITEMS));
    recalculateStats(SAMPLE_HISTORY_ITEMS);
    
    // Sync sample items to Firebase
    SAMPLE_HISTORY_ITEMS.forEach((item) => syncItemToFirestore(item));
  } catch (e) {
    console.error("Failed to restore sample history", e);
  }
}

export function importHistory(items: AnalysisResult[]): { added: number; total: number } {
  try {
    const current = getHistory();
    const currentIds = new Set(current.map((i) => i.id));
    const validNew = items.filter((i) => i && i.inputContent && !currentIds.has(i.id));

    const combined = [...validNew, ...current].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(combined));
    recalculateStats(combined);

    // Sync imported to Firestore
    validNew.forEach((item) => syncItemToFirestore(item));

    return { added: validNew.length, total: combined.length };
  } catch (e) {
    console.error("Failed to import history", e);
    return { added: 0, total: 0 };
  }
}

export function getUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  const history = getHistory();
  return recalculateStats(history);
}

export function recalculateStats(history: AnalysisResult[]): UserStats {
  let threats = 0;
  let safe = 0;

  for (const item of history) {
    if (item.risk === "high" || item.risk === "critical" || item.risk === "medium") {
      threats += 1;
    } else {
      safe += 1;
    }
  }

  let quizScore = 0;
  let quizCompleted = false;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      quizScore = parsed.quizScore || 0;
      quizCompleted = parsed.quizCompleted || false;
    }
  } catch {}

  const stats: UserStats = {
    totalScans: history.length,
    threatsDetected: threats,
    safeScans: safe,
    quizScore,
    quizCompleted,
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}

  return stats;
}

export function saveQuizScore(score: number): void {
  try {
    const stats = getUserStats();
    stats.quizScore = score;
    stats.quizCompleted = true;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getSavedDossier(): VictimDossierInput | null {
  try {
    const raw = localStorage.getItem(DOSSIER_DRAFTS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDossierDraft(data: VictimDossierInput): void {
  try {
    localStorage.setItem(DOSSIER_DRAFTS_KEY, JSON.stringify(data));

    // Save to Firestore dossiers collection
    const id = data.victimCpf || data.victimName ? `${data.victimName || "draft"}_${Date.now()}` : `dossier_${Date.now()}`;
    const docRef = doc(db, FIREBASE_DOSSIERS_COLLECTION, id.replace(/[^a-zA-Z0-9_-]/g, "_"));
    setDoc(docRef, {
      ...data,
      savedAt: new Date().toISOString(),
    }, { merge: true }).catch((e) => console.warn("Firestore dossier sync:", e));
  } catch {}
}
