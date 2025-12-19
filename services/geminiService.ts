import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Listing, MatchResult, AIMatchResult, VoiceCommandResponse, Industry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error generating AI description.";
  }
};

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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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
    
    // The response text is a JSON string based on the schema
    const results = JSON.parse(jsonStr) as Omit<AIMatchResult, 'listingId'>[];
    
    // Hydrate with listingId
    return results.map(r => ({ ...r, listingId: listing.id }));

  } catch (error) {
    console.error("Error matching leads:", error);
    return [];
  }
};

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
         - 'CREATE_TASK': User wants to set a reminder or task. Extract 'title' and 'dueDate' (e.g. "tomorrow", "next week").
      
      3. If LOG_INTERACTION, you MUST try to find the 'matchedEntityName' from the provided Context lists.
      
      Output JSON format.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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
                        // Task fields
                        dueDate: { type: Type.STRING, nullable: true }
                    },
                    nullable: true
                }
            }
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