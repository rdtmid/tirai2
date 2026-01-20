
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SiteCategory, ThreatLevel, HostReconResult } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found. AI features disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTorContent = async (content: string): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  if (!ai) {
    throw new Error("Missing API Key. Cannot perform analysis.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following RAW TEXT captured from a Tor Hidden Service. 
      This is REAL data. Do not hallucinate. If the text is insufficient, state that.
      
      Classify the site, determine the threat level, summarize, and extract entities.
      
      Content: "${content.substring(0, 10000)}"`, // Limit characters
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatScore: { type: Type.NUMBER },
            category: { 
              type: Type.STRING, 
              enum: ["MARKETPLACE", "FORUM", "BLOG", "WHISTLEBLOWER", "RANSOMWARE", "UNKNOWN"]
            },
            summary: { type: Type.STRING },
            entities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            suggestedAction: { type: Type.STRING }
          },
          required: ["threatScore", "category", "summary", "entities", "suggestedAction"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      threatScore: 0,
      category: SiteCategory.UNKNOWN,
      summary: "AI Analysis Failed: " + (error instanceof Error ? error.message : "Unknown error"),
      entities: [],
      suggestedAction: "Check logs."
    };
  }
};

export const analyzeInfrastructure = async (target: string, scanData: any): Promise<HostReconResult> => {
  const ai = getAiClient();

  if (!ai) throw new Error("Missing API Key");

  // We feed the AI the REAL scan data from our backend (headers, html title, etc)
  const context = JSON.stringify(scanData);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this technical reconnaissance data gathered from a live scan of: "${target}".
      
      Data collected: ${context}
      
      Based strictly on these HTTP headers, server signatures, and available location data, build a profile.
      If specific data (like tech stack) is missing from the headers, mark it as Unknown. Do not invent open ports.
      
      Return a JSON object matching HostReconResult.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING },
            ipEstimate: { type: Type.STRING },
            provider: { type: Type.STRING },
            location: { type: Type.STRING },
            serverHeader: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            openPorts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  port: { type: Type.NUMBER },
                  service: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            ownershipClues: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAssessment: { type: Type.STRING },
            ipHistory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ip: { type: Type.STRING },
                  date: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            }
          },
          required: ["target", "riskAssessment", "vulnerabilities"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as HostReconResult;
  } catch (error) {
    console.error("Gemini Recon Error:", error);
    throw error;
  }
};
