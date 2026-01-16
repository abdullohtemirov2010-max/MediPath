
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SymptomAnalysis {
  explanation: string;
  riskLevel: RiskLevel;
  nextSteps: string[];
  suggestedOTCMedicines: string[];
  warningSigns: string[];
  medicalCodes: string[]; // Added: ICD-10 or clinical reference codes
  shouldSeeDoctor: boolean; // Added: Decision logic for "Go to Doctor" button
  sources?: GroundingSource[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
