export type RiskLevel = "low" | "medium" | "high" | "critical";

export type AnalysisType = "pix" | "phone" | "link" | "message" | "image" | "boleto" | "general";

export interface OfficialChannel {
  name: string;
  contact: string;
  note: string;
}

export interface AnalysisResult {
  id?: string;
  timestamp?: number;
  inputContent: string;
  type: AnalysisType;
  risk: RiskLevel;
  riskScore: number;
  title: string;
  scamCategory: string;
  summary: string;
  redFlags: string[];
  recommendations: string[];
  explanation: string;
  officialChannels: OfficialChannel[];
  actionableSteps: string[];
  analyzedWithAi?: boolean;
  imagePreview?: string;
}

export interface BankContact {
  id: string;
  name: string;
  code: string;
  emergencyPhone: string;
  sacPhone: string;
  antiFraudEmail?: string;
  medGuideUrl?: string;
  logoColor: string;
  tips: string[];
}

export interface PoliceStation {
  state: string;
  stateName: string;
  url: string;
  notes: string;
}

export interface ScamInfo {
  id: string;
  title: string;
  category: "pix" | "whatsapp" | "bank" | "shopping" | "jobs" | "identity";
  severity: "high" | "critical";
  summary: string;
  howItWorks: string[];
  redFlags: string[];
  prevention: string[];
  realExample: string;
}

export interface VictimDossierInput {
  victimName: string;
  victimCpf?: string;
  victimPhone?: string;
  bankName: string;
  amountLost: string;
  incidentDate: string;
  incidentTime?: string;
  scamType: string;
  suspectInfo: string;
  description: string;
  evidenceNotes?: string;
}

export interface QuizQuestion {
  id: number;
  scenarioType: string;
  sender: string;
  messageText: string;
  mediaType?: "sms" | "whatsapp" | "email" | "receipt";
  isScam: boolean;
  scamName?: string;
  explanation: string;
  redFlags: string[];
}

export interface ScamIncident {
  id: string;
  title: string;
  category: string;
  city: string;
  state: string;
  ddd: string;
  lat: number;
  lng: number;
  reportedCount: number;
  avgLoss: string;
  riskLevel: RiskLevel;
  date: string;
  details: string;
  suspectMethod: string;
}

export interface CyberPoliceUnit {
  id: string;
  name: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  email?: string;
  onlineBoUrl: string;
  specialty: string;
}
