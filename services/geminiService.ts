import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, SiteCategory, ThreatLevel, HostReconResult, WhoisResult } from '../types';

// Initialize Gemini Client
// In a real app, ensure process.env.API_KEY is properly configured
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeTorContent = async (content: string): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  // Fallback if no API key is present (simulation mode for UI demonstration)
  if (!ai) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                threatScore: Math.floor(Math.random() * 40) + 60,
                category: SiteCategory.MARKETPLACE,
                threatLevel: ThreatLevel.HIGH,
                summary: "SIMULATED ANALYSIS: API Key missing. Content appears to be a marketplace selling illicit digital goods based on keyword heuristics.",
                entities: ["BTC-Wallet-123", "User:DarkAdmin"],
                suggestedAction: "Monitor and attempt to trace cryptocurrency addresses."
            } as any); // Type cast for simulated return
        }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following text intercepted from a TOR hidden service. 
      Classify the site, determine the threat level (LOW, MEDIUM, HIGH, CRITICAL), assign a threat score (0-100), summarize the findings, extract any relevant entities (usernames, crypto addresses, PGPs), and suggest a course of action for law enforcement.
      
      Content: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatScore: { type: Type.NUMBER, description: "0 to 100 threat score" },
            category: { 
              type: Type.STRING, 
              enum: ["MARKETPLACE", "FORUM", "BLOG", "WHISTLEBLOWER", "RANSOMWARE", "UNKNOWN"],
              description: "Category of the hidden service"
            },
            summary: { type: Type.STRING, description: "Brief executive summary of the content" },
            entities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of extracted entities (users, crypto addresses, emails)"
            },
            suggestedAction: { type: Type.STRING, description: "Recommended action for LEA" }
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
    // Return a safe fallback error object
    return {
      threatScore: 0,
      category: SiteCategory.UNKNOWN,
      summary: "Analysis failed due to API error.",
      entities: [],
      suggestedAction: "Check API connectivity and retry."
    };
  }
};

export const analyzeInfrastructure = async (target: string): Promise<HostReconResult> => {
  const ai = getAiClient();

  if (!ai) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          target: target,
          ipEstimate: "185.193.x.x (Masked)",
          provider: "Offshore-Cloud-X",
          location: "Moldova",
          serverHeader: "nginx/1.18.0 (Ubuntu)",
          techStack: ["PHP 8.1", "Laravel", "MySQL", "Redis"],
          openPorts: [
            { port: 80, service: "HTTP", status: "OPEN", version: "nginx" },
            { port: 443, service: "HTTPS", status: "OPEN" },
            { port: 22, service: "SSH", status: "FILTERED" }
          ],
          vulnerabilities: ["CVE-2023-XXXX (Potential PHP Misconfig)", "Exposed Server Status"],
          ownershipClues: ["PGP Key matches 'Admin_Dark'", "Language setting: ru-RU"],
          riskAssessment: "High probability of bulletproof hosting. Server configuration suggests a sophisticated operation with load balancing.",
          ipHistory: [
            { ip: "185.193.120.44", date: "2023-10-12", location: "Moldova (AlexHost)" },
            { ip: "91.215.88.201", date: "2023-06-05", location: "Russia (Selectel)" },
            { ip: "45.155.205.10", date: "2023-01-20", location: "Panama (Nord)" }
          ]
        });
      }, 2000);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a simulated infrastructure reconnaissance analysis for the following target hidden service address/name: "${target}".
      
      Generate a REALISTIC profile for this type of darknet site. 
      Infer probable hosting locations (e.g. Russia, Moldova, Panama), tech stacks, common misconfigurations, and ownership clues based on typical patterns for this type of site.
      Also generate a plausible history of previous IP addresses and hosting changes for this service.
      
      Return a JSON object matching the HostReconResult structure.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING },
            ipEstimate: { type: Type.STRING, description: "Estimated IP range or 'Masked'" },
            provider: { type: Type.STRING, description: "Likely hosting provider" },
            location: { type: Type.STRING, description: "Likely physical location" },
            serverHeader: { type: Type.STRING, description: "Server software header" },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            openPorts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  port: { type: Type.NUMBER },
                  service: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["OPEN", "FILTERED"] },
                  version: { type: Type.STRING }
                },
                required: ["port", "service", "status"]
              }
            },
            vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            ownershipClues: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskAssessment: { type: Type.STRING, description: "Detailed risk and sophistication assessment" },
            ipHistory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ip: { type: Type.STRING },
                  date: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["ip", "date", "location"]
              }
            }
          },
          required: ["target", "provider", "location", "serverHeader", "techStack", "openPorts", "vulnerabilities", "ownershipClues", "riskAssessment", "ipHistory"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as HostReconResult;
  } catch (error) {
    console.error("Gemini Infrastructure Analysis Error:", error);
     return {
          target: target,
          ipEstimate: "Unknown",
          provider: "Unknown",
          location: "Unknown",
          serverHeader: "Unknown",
          techStack: [],
          openPorts: [],
          vulnerabilities: [],
          ownershipClues: [],
          riskAssessment: "Analysis failed due to API error.",
          ipHistory: []
        };
  }
};

export const performWhoisLookup = async (ip: string): Promise<WhoisResult> => {
  const ai = getAiClient();

  if (!ai) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                query: ip,
                asn: "AS12345 Example Offshore Hosting",
                cidr: "185.193.0.0/16",
                organization: "Offshore Cloud Solutions Ltd",
                countryCode: "MD",
                created: "2020-05-15",
                updated: "2023-11-20",
                status: ["active", "allocated"],
                contacts: [{ type: "abuse", email: "abuse@offshore-cloud.xyz" }],
                rawText: `inetnum:        185.193.0.0 - 185.193.255.255\nnetname:        OFFSHORE-CLOUD\ndescr:          Offshore Cloud Solutions Ltd\ncountry:        MD\nadmin-c:        OC-RIPE\ntech-c:         OC-RIPE\nstatus:         ASSIGNED PA\nmnt-by:         OFFSHORE-MNT\ncreated:        2020-05-15T10:00:00Z\nlast-modified:  2023-11-20T14:30:00Z\nsource:         RIPE`
            });
        }, 1500);
    });
  }

  try {
     const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a realistic WHOIS lookup result for the IP address or entity: "${ip}". 
        The context is a darknet hosting provider investigation.
        Return a JSON object matching the WhoisResult structure with a "rawText" field resembling actual terminal output.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    query: { type: Type.STRING },
                    asn: { type: Type.STRING },
                    cidr: { type: Type.STRING },
                    organization: { type: Type.STRING },
                    countryCode: { type: Type.STRING },
                    created: { type: Type.STRING },
                    updated: { type: Type.STRING },
                    status: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contacts: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: {
                                type: { type: Type.STRING },
                                email: { type: Type.STRING }
                            }
                        } 
                    },
                    rawText: { type: Type.STRING }
                },
                required: ["query", "asn", "cidr", "organization", "countryCode", "created", "rawText"]
            }
        }
     });
     
     if (!response.text) throw new Error("No response");
     return JSON.parse(response.text) as WhoisResult;

  } catch (error) {
     console.error("Whois error", error);
     return {
         query: ip,
         asn: "Unknown",
         cidr: "Unknown",
         organization: "Lookup Failed",
         countryCode: "XX",
         created: "Unknown",
         updated: "Unknown",
         status: [],
         contacts: [],
         rawText: "Error performing WHOIS lookup."
     };
  }
};
