import { getEmissionFactors } from "../db/emissionFactors";
import { EmissionFactor } from "../types";

export interface ClassificationResult {
  emission_factor_id: string | null;
  amount: number;
  source_type: string;
  confidence: number;
  explanation: string;
}

const cleanJsonString = (raw: string): string => {
  // Remove markdown code blocks if the model ignored instructions
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
};

const callGemini = async (apiKey: string, prompt: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemini API returned status ${response.status}: ${errText}`,
    );
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }
  return text;
};

const callOllama = async (
  prompt: string,
  modelName: string = "qwen2.5:3b", // Excellent local instruction following JSON model
): Promise<string> => {
  const url = "http://localhost:11434/api/generate";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      prompt: prompt,
      format: "json",
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama local endpoint returned status ${response.status}`);
  }

  const result = await response.json();
  return result.response;
};

export const classifyActivityDescription = async (
  description: string,
  preferredLocalModel: string = "qwen2.5:3b",
): Promise<ClassificationResult & { provider: "gemini" | "ollama" }> => {
  // 1. Fetch active factors to pass as context
  const factors = await getEmissionFactors();
  const activeFactors = factors.filter((f) => f.factor_value > 0);

  const factorsContext = activeFactors
    .map(
      (f) =>
        `ID: ${f.id} | Name: ${f.name} | Category: ${f.category} | Unit: ${f.unit}`,
    )
    .join("\n");

  const prompt = `You are an expert ESG carbon accountant.
Your task is to classify the following purchase/activity description into a structured carbon accounting ledger entry.

Available Emission Factors in our system database:
${factorsContext}

Input Activity Description: "${description}"

Tasks:
1. Identify the single best matching emission factor ID from the list above. If no factors match, set "emission_factor_id" to null.
2. Extract the numerical usage amount from the description (e.g. if description says "Bought 150 liters of diesel fuel", amount is 150. If description says "1200 kWh electricity bill", amount is 1200). If no quantity is specified, set "amount" to 0.
3. Identify a brief, professional source title for the activity (e.g., "Electricity Consumption", "Fleet Diesel Refuel").
4. Assign a confidence score from 0.0 to 1.0.

Return ONLY a valid JSON object in this format (no markdown blocks, no leading/trailing text):
{
  "emission_factor_id": "matching uuid or null",
  "amount": number,
  "source_type": "brief title",
  "confidence": number,
  "explanation": "short reason why this factor was chosen"
}`;

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim() !== "") {
    try {
      console.log("Attempting classification via Gemini API...");
      const responseText = await callGemini(geminiKey, prompt);
      const cleaned = cleanJsonString(responseText);
      const parsed = JSON.parse(cleaned);
      return {
        ...parsed,
        provider: "gemini",
      };
    } catch (geminiErr: any) {
      console.warn(
        "Gemini classification failed. Attempting local Ollama fallback...",
        geminiErr,
      );
    }
  }

  // Fallback to Ollama
  try {
    console.log(
      `Attempting classification via local Ollama (${preferredLocalModel})...`,
    );
    const responseText = await callOllama(prompt, preferredLocalModel);
    const cleaned = cleanJsonString(responseText);
    const parsed = JSON.parse(cleaned);
    return {
      ...parsed,
      provider: "ollama",
    };
  } catch (ollamaErr: any) {
    console.error("Ollama classification failed as well:", ollamaErr);
    throw new Error(
      "AI Classification failed. Both Gemini API and local Ollama fallback were unreachable.",
    );
  }
};
