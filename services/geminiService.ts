import { GoogleGenAI, Type } from "@google/genai";
import { Lead, Listing, MatchResult, AIMatchResult } from "../types";

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
      Revenue: $${listing.revenue}
      EBITDA: $${listing.ebitda}
      Asking Price: $${listing.askingPrice}
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