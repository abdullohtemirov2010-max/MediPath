
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomAnalysis, GroundingSource } from "../types";

const SYSTEM_INSTRUCTION = `
You are MadiPath Intelligence, a clinical triage engine by Abdulloh Temirov. 
Analyze symptoms with depth and clinical accuracy using real-time search data.

REQUIRED OUTPUT FORMAT (JSON):
{
  "explanation": "Brief clinical reasoning including potential sources of the illness.",
  "riskLevel": "Low" | "Medium" | "High",
  "nextSteps": ["List of actions"],
  "suggestedOTCMedicines": ["Generic names only"],
  "warningSigns": ["Emergency indicators"],
  "medicalCodes": ["Clinical codes like ICD-10, SNOMED, or DSM-5 relevant to the symptoms"],
  "shouldSeeDoctor": true | false
}

CRITICAL RULES:
1. "shouldSeeDoctor" MUST be true if RiskLevel is 'High' or 'Medium', or if symptoms are persistent.
2. In "explanation", specifically mention potential sources or environmental factors identified via Google Search.
3. Provide at least 2-3 medical codes for professional reference.
4. NEVER provide a final diagnosis. Focus on the URGENCY of care.
`;

const DEFAULT_SAFE_ASSESSMENT: SymptomAnalysis = {
  explanation: "MadiPath Clinical Safety Layer: Symptoms indicate a need for professional evaluation. We recommend monitoring for changes in respiratory rate and temperature.",
  riskLevel: "Medium",
  nextSteps: [
    "Monitor symptoms for the next 24-48 hours",
    "Stay hydrated and rest",
    "Seek professional consultation if symptoms persist"
  ],
  suggestedOTCMedicines: ["Consult a pharmacist"],
  warningSigns: ["Shortness of breath", "Persistent high fever", "Unexplained chest pain"],
  medicalCodes: ["R69 (Undiagnosed symptoms)"],
  shouldSeeDoctor: true
};

export const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysis> => {
  const query = symptoms.toLowerCase().trim();
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Neural Core disconnected. Please re-sync.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: `Perform deep clinical triage and identify source/codes for: ${symptoms}` }] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedOTCMedicines: { type: Type.ARRAY, items: { type: Type.STRING } },
            warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
            medicalCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
            shouldSeeDoctor: { type: Type.BOOLEAN },
          },
          required: ['explanation', 'riskLevel', 'nextSteps', 'suggestedOTCMedicines', 'warningSigns', 'medicalCodes', 'shouldSeeDoctor'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("SAFETY_BLOCK");

    const parsed = JSON.parse(text) as SymptomAnalysis;
    
    // Citations mapping
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const sources: GroundingSource[] = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || 'Medical Reference',
          uri: c.web.uri
        }));
      if (sources.length > 0) {
        parsed.sources = sources;
      }
    }

    return parsed;

  } catch (error: any) {
    console.error("MadiPath Fallback Triggered:", error);
    const isEmergency = ['chest', 'heart', 'breath', 'stroke', 'unconscious'].some(w => query.includes(w));
    
    return {
      ...DEFAULT_SAFE_ASSESSMENT,
      riskLevel: isEmergency ? "High" : "Medium",
      shouldSeeDoctor: true,
      explanation: isEmergency 
        ? "MadiPath Safety Alert: High-risk symptoms detected. This requires immediate clinical intervention."
        : DEFAULT_SAFE_ASSESSMENT.explanation
    };
  }
};
