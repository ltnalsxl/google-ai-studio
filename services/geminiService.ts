import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for the detailed analysis output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "Strict objective score from 0 to 100 based on requirements.",
    },
    fitLabel: {
      type: Type.STRING,
      enum: ["High Fit", "Medium Fit", "Low Fit", "Overstretch"],
      description: "Overall classification of the candidate's fit.",
    },
    summary: {
      type: Type.STRING,
      description: "Executive summary of the analysis.",
    },
    categoryScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: "e.g., Hard Skills, Domain Knowledge, Experience Depth" },
          score: { type: Type.NUMBER },
          reason: { type: Type.STRING, description: "Brief justification for the score." },
        },
      },
    },
    levelFit: {
      type: Type.OBJECT,
      properties: {
        label: { type: Type.STRING, description: "The detected seniority level of the JD (e.g., Senior, Junior)." },
        assessment: { type: Type.STRING, description: "Comparison of candidate's level vs JD level." },
      },
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Critical keywords found in JD but missing in Resume.",
    },
    strongMatches: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Areas where the candidate is a perfect match.",
    },
    tailoringGuide: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["rewrite", "add", "keyword"] },
          suggestion: { type: Type.STRING, description: "Actionable advice." },
          reason: { type: Type.STRING, description: "Why this change helps." },
          example: { type: Type.STRING, description: "A concrete example sentence or bullet point to use." },
        },
      },
      description: "Guide on how to translate generic experience into JD-specific language.",
    },
  },
  required: ["overallScore", "fitLabel", "summary", "categoryScores", "levelFit", "missingKeywords", "strongMatches", "tailoringGuide"],
};

export const analyzeJobFit = async (
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    const prompt = `
      You are an objective, strict, and expert Technical Recruiter and Career Coach.
      
      Your goal is to analyze a candidate's "Master Resume" against a specific "Job Description" (JD).
      
      **CRITICAL INSTRUCTIONS:**
      1. **Objective Scoring**: Maintain a high standard. 100% means they are the perfect unicorn candidate. 
      2. **Translate Experience**: If the candidate has generic experience (e.g., "Built a website"), but the JD asks for specific terms (e.g., "Architected scalable frontend using React"), acts as a translator. Identify if the candidate likely has the skill based on context, even if the keyword is missing, and suggest how to rewrite it.
      3. **Gap Analysis**: Identify what is truly missing (Deal Breakers).
      4. **Language**: If the input is Korean, the output must be in Korean.

      **ANALYSIS TASKS:**
      - Calculate scores for: Hard Skills, Domain Knowledge, Experience Depth.
      - Assess Seniority Fit (Is the candidate too junior, too senior, or just right?).
      - Create a "Tailoring Guide": specific bullet points the user should copy-paste to replace their generic ones.

      RESUME:
      ${resumeText.substring(0, 25000)} 

      JOB DESCRIPTION:
      ${jobDescription.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing job fit:", error);
    throw error;
  }
};