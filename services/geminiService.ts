
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Listing, AIMatchResult, VoiceCommandResponse, Industry } from "../types";

// Always initialize the SDK with a named parameter for apiKey
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Select recommended models based on task complexity
const FAST_MODEL = 'gemini-3-flash-preview';
const REASONING_MODEL = 'gemini-3-pro-preview';

/**
 * Generates a professional business listing description using AI.
 */
export const generateListingDescription = async (listing: Partial<Listing>): Promise<string> => {
  try {
    const prompt = `
      Act as a professional business broker. Write a compelling, confidential "Teaser" description for a business for sale.
      Do not mention specific names if not provided, keep it professional and alluring.
      
      Details:
      Industry: ${listing.industry}
      Location: ${listing.location}
      Revenue: AED ${listing.revenue}
      EBITDA: AED ${listing.ebitda}
      Asking Price: AED ${listing.askingPrice}
      Key Highlights: ${listing.description || 'N/A'}
      
      Output only the description paragraph.
    `;

    // Use ai.models.generateContent to fetch results directly
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
    });

    // Access the text property directly from the response object
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error generating AI description.";
  }
};

/**
 * Analyzes the fit between a listing and leads using complex reasoning.
 */
export const analyzeMatch = async (listing: Listing, leads: Lead[]): Promise<AIMatchResult[]> => {
  try {
    const prompt = `
      You are an expert Deal Matchmaker. 
      Analyze the "Fit" between the following Business Listing and the List of Potential Buyers (Leads).
      
      Listing:
      ${JSON.stringify({
        industry: listing.industry,
        price: listing.askingPrice,
        location: listing.location,
        financials: `Rev: ${listing.revenue}, EBITDA: ${listing.ebitda}`
      })}

      Leads:
      ${JSON.stringify(leads.map(l => ({
        id: l.id,
        budget: `${l.minBudget} - ${l.maxBudget}`,
        industries: l.preferredIndustries,
        notes: l.notes
      })))}

      Return a JSON array of objects. Each object must have:
      - leadId (string)
      - score (number, 0-100)
      - reasoning (string, concise explanation of why it fits or doesn't)
    `;

    // Use gemini-3-pro-preview for complex reasoning and matching tasks
    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              leadId: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["leadId", "score", "reasoning"]
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    // Parse the JSON string result from the model's text output
    const results = JSON.parse(jsonStr) as Omit<AIMatchResult, 'listingId'>[];
    
    // Hydrate the matching results with the listingId
    return results.map(r => ({ ...r, listingId: listing.id }));

  } catch (error) {
    console.error("Error matching leads:", error);
    return [];
  }
};

/**
 * Processes multimodal audio input to determine CRM intent and extract data.
 */
export const processVoiceCommand = async (
  audioBase64: string, 
  context: { leadNames: string[], listingTitles: string[] }
): Promise<VoiceCommandResponse> => {
  try {
    const prompt = `
      You are the intelligent voice interface for a Business Brokerage CRM.
      The user is speaking to the system to perform an action.
      
      Context:
      Existing Buyers: ${JSON.stringify(context.leadNames)}
      Existing Listings: ${JSON.stringify(context.listingTitles)}
      Known Industries: ${Object.values(Industry).join(', ')}

      Instructions:
      1. Transcribe the audio accurately.
      2. Determine the Intent from these options:
         - 'CREATE_LEAD': User wants to add a new buyer. Extract name, maxBudget, preferredIndustries (map to Known Industries), notes.
         - 'CREATE_LISTING': User wants to add a new business for sale. Extract title, askingPrice, ebitda, industry, location.
         - 'LOG_INTERACTION': User is summarizing a call or meeting. Fuzzy match the person/business name from Context. Extract the summary as 'notes'.
         - 'CREATE_LOG': User wants to set a reminder or add a log entry. Extract 'title' and 'dueDate' (e.g. "tomorrow", "next week").
      
      3. If LOG_INTERACTION, you MUST try to find the 'matchedEntityName' from the provided Context lists.
      
      Output JSON format.
    `;

    // Gemini 3 Flash efficiently handles multimodal inputs including audio
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/wav", data: audioBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                transcription: { type: Type.STRING },
                intent: { type: Type.STRING },
                matchedEntityName: { type: Type.STRING, nullable: true },
                data: { 
                    type: Type.OBJECT,
                    properties: {
                        // Lead fields
                        name: { type: Type.STRING, nullable: true },
                        maxBudget: { type: Type.NUMBER, nullable: true },
                        preferredIndustries: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                        notes: { type: Type.STRING, nullable: true },
                        // Listing fields
                        title: { type: Type.STRING, nullable: true },
                        askingPrice: { type: Type.NUMBER, nullable: true },
                        ebitda: { type: Type.NUMBER, nullable: true },
                        revenue: { type: Type.NUMBER, nullable: true },
                        industry: { type: Type.STRING, nullable: true },
                        location: { type: Type.STRING, nullable: true },
                        // Task fields (Mapped to LogEntry)
                        dueDate: { type: Type.STRING, nullable: true }
                    },
                    nullable: true
                }
            },
            required: ["transcription", "intent"]
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as VoiceCommandResponse;
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Error processing voice command:", error);
    return {
        transcription: "Error processing audio. Please try again.",
        intent: "UNKNOWN",
        data: {}
    };
  }
};
