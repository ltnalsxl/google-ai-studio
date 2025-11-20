import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, UserContextItem } from "../types";

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
    jdStructure: {
      type: Type.OBJECT,
      description: "Parsed structure of the Job Description.",
      properties: {
        summary: { type: Type.STRING },
        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        qualifications: { type: Type.ARRAY, items: { type: Type.STRING } },
        preferred: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
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
    creativeConnections: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Unique insights connecting user's hobbies/values/notes to the job. E.g., 'User's interest in puzzles indicates strong problem-solving needed for this debugging role.'",
    },
  },
  required: ["overallScore", "fitLabel", "summary", "jdStructure", "categoryScores", "levelFit", "missingKeywords", "strongMatches", "tailoringGuide", "creativeConnections"],
};

export const analyzeJobFit = async (
  userContext: UserContextItem[],
  jobDescription: string
): Promise<AnalysisResult> => {
  try {
    const model = "gemini-2.5-flash";
    
    // Aggregate User Context
    const contextString = userContext.map(item => `
      [TYPE: ${item.type.toUpperCase()}] - Title: ${item.title}
      CONTENT:
      ${item.content.substring(0, 10000)}
      ----------------------------------------
    `).join('\n');

    const prompt = `
      You are an objective, strict, and expert Technical Recruiter and Career Coach.
      
      Your goal is to analyze a candidate's **Holistic Profile** against a specific "Job Description" (JD).
      The user has provided not just a resume, but potentially hobbies, values, and informal notes.
      
      **CRITICAL INSTRUCTIONS:**
      1. **Objective Scoring**: Maintain a high standard. 100% means they are the perfect unicorn candidate.
      2. **Parse JD**: Extract the key sections.
      3. **CONNECT THE DOTS**: This is your superpower. Look for non-obvious connections. 
         - If the user has a hobby (e.g., "Marathon Running"), connect it to soft skills (e.g., "Grit, Long-term planning") if relevant to the JD.
         - If the user lists a value (e.g., "Sustainability"), check if the company mission aligns.
      4. **Translate Experience**: If the candidate has generic experience (e.g., "Built a website"), but the JD asks for specific terms (e.g., "Architected scalable frontend using React"), identify if the candidate likely has the skill based on context and suggest how to rewrite it.
      5. **Gap Analysis**: Identify what is truly missing.
      6. **Language**: If the input is Korean, the output must be in Korean.

      **ANALYSIS TASKS:**
      - Calculate scores for: Hard Skills, Domain Knowledge, Experience Depth.
      - Assess Seniority Fit.
      - Create a "Tailoring Guide".
      - **Creative Connections**: Specifically list how their hobbies/values map to the job.

      CANDIDATE HOLISTIC PROFILE:
      ${contextString} 

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

export const generateTailoredResume = async (
  userContext: UserContextItem[],
  jobDescription: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";

    // Aggregate User Context
    const contextString = userContext.map(item => `
      [TYPE: ${item.type.toUpperCase()}] - Title: ${item.title}
      CONTENT:
      ${item.content}
    `).join('\n');

    const prompt = `
      You are an expert Resume Writer. 
      Rewrite the candidate's resume to specifically target the Job Description provided.
      
      **Crucial:**
      You have access to the candidate's "Holistic Profile" (Hobbies, Notes, Values). 
      If a hobby or random note is RELEVANT to the job (e.g., they play team sports and the job requires teamwork), **incorporate it professionally** into the resume (e.g., in a 'Interests' or 'Summary' section).

      **Instructions:**
      1. **Professional Summary**: Rewrite to highlight skills and experiences most relevant to the JD.
      2. **Experience Bullets**: Rephrase existing bullets to use keywords and language found in the JD. Use the STAR method. 
      3. **Prioritization**: Move the most relevant bullets to the top of each role.
      4. **Skills**: Reorder skills to match the JD's priority.
      5. **Truthfulness**: Do NOT invent experiences. Only reframe existing ones.
      6. **Output**: Provide ONLY the full Markdown content of the new resume. Do not add conversational text.

      CANDIDATE HOLISTIC PROFILE:
      ${contextString}

      TARGET JOB DESCRIPTION:
      ${jobDescription.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Failed to generate resume.";
  } catch (error) {
    console.error("Error generating tailored resume:", error);
    throw error;
  }
};

export const polishExperience = async (
  rawExperience: string
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a Career Coach helping a student or junior professional.
      Convert the following "raw" or "informal" experience description into 3-5 professional, high-impact resume bullet points using the STAR method (Situation, Task, Action, Result).
      
      If the input is Korean, output in Korean. If English, output in English.
      
      Raw Experience:
      "${rawExperience}"
      
      Output Format:
      - Bullet 1
      - Bullet 2
      ...
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Failed to polish experience.";
  } catch (error) {
    console.error("Error polishing experience:", error);
    throw error;
  }
};

export const generateUserPersona = async (userContext: UserContextItem[]): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const contextString = userContext.map(item => `
      [TYPE: ${item.type.toUpperCase()}] - Title: ${item.title}
      CONTENT:
      ${item.content}
    `).join('\n');

    const prompt = `
      You are a Career Strategy Expert.
      Analyze the following "Holistic User Profile" which includes resumes, hobbies, values, and notes.
      
      Your goal is to describe "Who this person is" to them from a professional branding perspective.
      
      **Output Structure (Markdown):**
      1. **Professional Headline**: A 1-sentence branding statement.
      2. **Key Strengths**: 3-4 distinct professional superpowers.
      3. **The "X-Factor"**: Connect their hobbies/values to their work style. (e.g., "Your interest in chess suggests you enjoy strategic foresight in engineering...").
      4. **Narrative Summary**: A brief, encouraging paragraph describing their career potential.

      USER DATA:
      ${contextString}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Could not generate persona.";
  } catch (error) {
    console.error("Error generating persona:", error);
    throw error;
  }
};

export const extractJobFromUrl = async (url: string): Promise<{ title: string; company: string; description: string }> => {
  try {
    const model = "gemini-2.5-flash";
    // Updated prompt to be more "Search" oriented rather than "Browse" oriented to avoid tool refusal
    const prompt = `
      I need to find the job description details for the job posting located at this URL: ${url}
      
      Please use Google Search to find the content of this job posting.
      
      Extract the Job Title, Company Name, and the full Job Description text.
      
      Output format:
      TITLE: [Job Title]
      COMPANY: [Company Name]
      DESCRIPTION:
      [Full Job Description Text]
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Basic parsing of the expected format
    const titleMatch = text.match(/TITLE:\s*(.+)/i);
    const companyMatch = text.match(/COMPANY:\s*(.+)/i);
    
    const descMarker = "DESCRIPTION:";
    const descIndex = text.toUpperCase().indexOf(descMarker);
    
    let description = "";
    if (descIndex !== -1) {
        description = text.substring(descIndex + descMarker.length).trim();
    } else {
        // Fallback: just return whole text if format isn't perfect
        description = text;
    }

    return {
      title: titleMatch ? titleMatch[1].trim() : "",
      company: companyMatch ? companyMatch[1].trim() : "",
      description: description
    };

  } catch (error) {
    console.error("Error extracting job from URL:", error);
    throw error;
  }
};

export const extractTextFromPdf = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: "Extract all the text content from this document accurately. Preserve the structure where possible."
        }
      ]
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
};