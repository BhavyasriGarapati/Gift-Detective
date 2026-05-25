import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to fail gracefully if the key is missing at startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Interactive gift finder API with Google Search Grounding & Resilient Fallbacks
app.post("/api/detect-gifts", async (req, res) => {
  try {
    const { age, hobbies, budget, likes } = req.body;

    if (!age || !hobbies || !budget) {
      return res.status(400).json({ error: "Please provide age, hobbies, and budget." });
    }

    const ai = getGeminiClient();

    const prompt = `
You are the world's finest "Gift Detective". Your mission is to find the perfect, available real-world gifts online right now based on the following recipient profile:
- Age / Life Stage: ${age}
- Hobbies & Interests: ${hobbies}
- Budget Limit: ${budget}
- Past Likes / Things they liked before: ${likes || "None specified"}

Use your advanced scouring capabilities to find active, real products currently sold online. Retrieve the actual product names, estimated prices, retail sources (where to buy), and explain exactly why each product is a brilliant fit for their specific age, hobbies, and likes. Avoid generic placeholders. 

Provide your final response as a structured JSON object with the exact keys:
- detectiveSummary: A short, detective-theme opening paragraph summing up the recipient's personality, interests, and budget and setting the case mood.
- gifts: An array of 3 to 5 highly specific real-world products. Each gift must contain:
    - name: Product name (be specific, e.g. "Fujifilm Instax Mini 12" rather than just "instant camera")
    - price: Approximate price (e.g. "$79")
    - url: Actual product page URL or search page reference URL discovered from your grounding resources
    - explanation: A detailed 2-3 sentence personalized deduction explaining why this matches their age, hobby, and budget
    - whereToBuy: Suggested stores to find it right now (e.g. "Amazon, Target, Target.com")
- caseDeductionDetail: A closing thought summarizing what makes this combination of choices logical for this specific person.
`;

    let response;
    let fallbackUsed = false;
    let groundingMetadata = null;

    try {
      // Primary attempt: Use Google Search Grounding
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["detectiveSummary", "gifts", "caseDeductionDetail"],
            properties: {
              detectiveSummary: { type: Type.STRING },
              gifts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["name", "price", "explanation", "whereToBuy"],
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    url: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    whereToBuy: { type: Type.STRING },
                  },
                },
              },
              caseDeductionDetail: { type: Type.STRING },
            },
          },
        },
      });
      groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
    } catch (primaryError: any) {
      console.warn("Primary grounded search failed. Executing high-quality semantic fallback...", primaryError);
      
      // Fallback attempt: Generate content WITHOUT googleSearch tool to bypass 429 quota exhaustion
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt + "\n\n(Important system context: Live search grounding quota has experienced heavy traffic. Immediately utilize your extensive semantic database to output real, current, premium products with correct, well-formed placeholder search URLs of the format: https://www.google.com/search?q=...) ",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["detectiveSummary", "gifts", "caseDeductionDetail"],
              properties: {
                detectiveSummary: { type: Type.STRING },
                gifts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "price", "explanation", "whereToBuy"],
                    properties: {
                      name: { type: Type.STRING },
                      price: { type: Type.STRING },
                      url: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      whereToBuy: { type: Type.STRING },
                    },
                  },
                },
                caseDeductionDetail: { type: Type.STRING },
              },
            },
          },
        });
        fallbackUsed = true;
      } catch (fallbackError: any) {
        throw new Error(fallbackError?.message || primaryError?.message || "Both search grounding and fallback model failed.");
      }
    }

    const parsedData = JSON.parse(response.text || "{}");

    // Ensure realistic URL structures on all generated products
    if (parsedData.gifts && Array.isArray(parsedData.gifts)) {
      parsedData.gifts = parsedData.gifts.map((gift: any) => {
        if (!gift.url || gift.url.trim() === "" || gift.url === "#" || !gift.url.startsWith("http")) {
          gift.url = `https://www.google.com/search?q=${encodeURIComponent(gift.name)}`;
        }
        return gift;
      });
    }

    res.json({
      data: parsedData,
      grounding: groundingMetadata,
      fallback: fallbackUsed
    });
  } catch (error: any) {
    console.error("Error in detect-gifts API:", error);
    
    const errorStr = String(error?.message || error || "");
    const isQuotaError = 
      errorStr.includes("RESOURCE_EXHAUSTED") || 
      errorStr.includes("quota") || 
      errorStr.includes("429") || 
      error?.status === 429 || 
      error?.status === "RESOURCE_EXHAUSTED" ||
      error?.code === 429;

    if (isQuotaError) {
      return res.status(429).json({
        error: "Google Gemini API rate limit or structural quota exceeded (429: RESOURCE_EXHAUSTED). Please wait a few moments and try and submit your request again, or enter your personal Gemini API Key with premium tiers in Settings > Secrets.",
        isQuota: true
      });
    }

    res.status(500).json({
      error: error?.message || "Something went wrong. Please check your API key in Settings > Secrets.",
    });
  }
});

// Configure Vite middleware or static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
