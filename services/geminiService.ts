import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CaseData, VerdictData } from "../types";

const verdictSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cuteOpening: {
      type: Type.STRING,
      description: "A cute, puppy-themed opening sentence welcoming the users (e.g., '汪！本小狗已听完双方陈述...').",
    },
    coreConflict: {
      type: Type.STRING,
      description: "A concise summary of the main conflict (e.g., 'Needs not perceived vs. Tone of voice').",
    },
    analysisPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 distinct bullet points evaluating: 1. Factual Logic, 2. Emotional Need Matching, 3. Communication Style Appropriateness.",
    },
    herPercentage: {
      type: Type.NUMBER,
      description: "The percentage of support for the female side (0-100).",
    },
    hisPercentage: {
      type: Type.NUMBER,
      description: "The percentage of support for the male side (0-100). Must add up to 100 with herPercentage.",
    },
    shortAdvice: {
      type: Type.STRING,
      description: "Immediate, actionable step (Action-oriented, e.g., 'Give a hug').",
    },
    longAdvice: {
      type: Type.STRING,
      description: "Long-term advice focusing on communication habits and understanding emotional needs.",
    },
  },
  required: ["cuteOpening", "coreConflict", "analysisPoints", "herPercentage", "hisPercentage", "shortAdvice", "longAdvice"],
};

export const getPuppyVerdict = async (data: CaseData): Promise<VerdictData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are "Puppy Judge" (小狗判官), a cute, fair, and rational AI mediator for couples.
    
    **Core Task:** 
    Analyze the argument between a couple based on the input provided and generate a structured "Verdict".

    **Analysis Framework (Internal Logic):**
    1. **Information Extraction**: Identify the core conflict (is it about the specific event, or underlying emotional needs?).
    2. **Rationality Assessment**: Evaluate both sides based on three dimensions:
       - **Fact Logic**: Who makes more logical sense in the context of reality?
       - **Emotional Needs**: Are the emotional needs being expressed valid? Are they being met by the partner?
       - **Communication Style**: Was the tone hurtful? Was there "violent communication"?
    3. **Stance Calculation**: Assign percentages based on the above assessment. Avoid 100/0 splits unless extreme.

    **Tone & Style:**
    - **Persona**: A wise but cute puppy. Use "汪" occasionally but keep the analysis professional yet accessible.
    - **Objective**: Be neutral.
    - **Empathetic**: Acknowledge feelings.
    - **Philosophy**: "Winning the relationship is more important than winning the argument."

    **Input Data:**
    - Context: ${data.background}
    - Her View: ${data.herSide}
    - His View: ${data.hisSide}
    - Extra Info: ${data.extraInfo || "None"}
    
    **Output Requirement:**
    Return the response STRICTLY in JSON format matching the schema. 
    - 'analysisPoints' must explicitly cover logic, emotions, and communication.
    - 'shortAdvice' is the "Short-term Action".
    - 'longAdvice' is the "Long-term Communication" advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: verdictSchema,
        systemInstruction: "You are a helpful relationship mediator with a cute puppy persona.",
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsedData = JSON.parse(jsonText) as VerdictData;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};