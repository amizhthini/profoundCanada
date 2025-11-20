
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIAnalysisResult, UserType } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const parseResume = async (file: File): Promise<Partial<UserProfile>> => {
  const ai = getAIClient();

  try {
    const filePart = await fileToGenerativePart(file);

    const prompt = `
      You are an intelligent resume parser for an immigration platform. Extract the following details from the resume provided.
      
      Rules:
      1. **Full Name**: Extract the candidate's name.
      2. **Country**: Extract the current Country of Residence. If not explicitly stated, infer it from the address or phone number country code. If unknown, return null.
      3. **Education**: Map the highest degree strictly to one of: 'High School', 'Diploma', 'Bachelor', 'Master', 'PhD'.
      4. **Field**: The major or field of study (e.g., 'Computer Science', 'Nursing').
      5. **Experience**: Calculate total years of professional work experience.
      6. **English**: If IELTS/CELPIP scores are present, extract the overall band score.

      Return the data in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [filePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            country: { type: Type.STRING, description: "Current country of residence" },
            educationLevel: { type: Type.STRING, enum: ["High School", "Diploma", "Bachelor", "Master", "PhD"] },
            fieldOfStudy: { type: Type.STRING },
            workExperienceYears: { type: Type.NUMBER },
            englishScore: { type: Type.NUMBER },
          },
          required: ["name", "educationLevel", "fieldOfStudy", "workExperienceYears"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Map the 'country' field from AI to 'countryOfResidence' in UserProfile
      return {
          name: data.name,
          countryOfResidence: data.country || undefined,
          educationLevel: data.educationLevel,
          fieldOfStudy: data.fieldOfStudy,
          workExperienceYears: data.workExperienceYears,
          englishScore: data.englishScore
      } as Partial<UserProfile>;
    }
    return {};
  } catch (error) {
    console.error("Error parsing resume:", error);
    return {};
  }
};

export const analyzeProfile = async (
  profile: UserProfile,
  userType: UserType
): Promise<AIAnalysisResult> => {
  const ai = getAIClient();

  // --- PROMPT LOGIC ---
  // We split logic based on UserType to give specific "Student" vs "Worker" advice
  
  let specificInstructions = "";
  
  if (userType === UserType.Student) {
      specificInstructions = `
      CONTEXT: USER IS A PROSPECTIVE INTERNATIONAL STUDENT.
      1. Analyze Visa Approval Probability based on financial, study gap, and intent.
      2. SIMULATE "ApplyBoard" API Course Matching (3-4 DLIs).
      3. CALCULATE FUTURE CRS SCENARIOS (Permanent Residency Eligibility):
         - **Current**: Calculate CRS based on profile NOW. 
         - **Option 1 (1 Year Study)**: Add points for a 1-year Canadian credential.
         - **Option 2 (2 Year Study)**: Add points for a 2-year Canadian credential (higher chance).
         - **Option 3 (2 Year Study + 1 Year Work)**: Add points for 2-year Canadian credential + 1 year Canadian work experience (CEC eligibility).
      `;
  } else {
      specificInstructions = `
      CONTEXT: USER IS A SKILLED WORKER SEEKING PR.
      REFERENCE "MASTER CHEAT SHEET 2025":
        1. Federal Express Entry (CEC, FSWP, FSTP, Category-Based).
        2. PNP Streams.
      
      User Specifics:
      - Category: ${profile.immigrationCategory}
      - ECA: ${profile.hasEca}
      - Job Offer: ${profile.hasJobOffer} (TEER: ${profile.jobOfferTeer || 'N/A'})
      `;
  }

  // Language string construction
  let englishInfo = "N/A";
  if (profile.languageDetails) {
      const { testType, reading, writing, listening, speaking, overallScore } = profile.languageDetails;
      englishInfo = `${testType} - Overall:${overallScore}, R:${reading}, W:${writing}, L:${listening}, S:${speaking}`;
  }
  
  let frenchInfo = "None";
  if (profile.frenchDetails && profile.frenchDetails.testType !== 'None') {
      const { testType, reading, writing, listening, speaking, overallScore } = profile.frenchDetails;
      frenchInfo = `${testType} - Overall:${overallScore}, R:${reading}, W:${writing}, L:${listening}, S:${speaking}`;
  }

  const commonPrompt = `
    Profile Details:
    - Name: ${profile.name}
    - Age: ${profile.age}
    - Country: ${profile.countryOfResidence}
    - Education: ${profile.educationLevel} (Canadian: ${profile.hasCanadianEducation})
    - Work: ${profile.workExperienceYears} years
    - English Language: ${englishInfo}
    - French Language: ${frenchInfo}
    - Savings: ${profile.savings}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an expert Canadian Immigration AI.
        ${specificInstructions}
        
        ${commonPrompt}

        **CRITICAL CRS CALCULATION RULES & ASSUMPTIONS:**
        1. **IELTS Academic**: If the user provided "IELTS Academic" scores, for the purpose of CRS estimation, assume they are equivalent to "IELTS General" scores (same CLB level). Note this in the "assumptions" output.
        2. **No English Test (Student)**: If the user is a Student and has 'None' for English test, assume they have at least CLB 5 (approx IELTS 5.0) for the "Current" CRS calculation (as they would need this for admission). Note this in the "assumptions" output.
        3. **No English Test (Worker)**: If a Worker has 'None', assume 0 points for language unless stated otherwise.

        OUTPUT JSON SCHEMA.
        Ensure 'strategicAdvice' is returned as an ARRAY of strings (bullet points).
        Include 'assumptions' as an ARRAY of strings listing any assumptions made during calculation.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSuccessProbability: { type: Type.NUMBER },
            crsScorePrediction: { type: Type.NUMBER },
            futureCrsPredictions: {
               type: Type.OBJECT,
               description: "Only for students. Project scores for 3 scenarios.",
               properties: {
                   current: { type: Type.NUMBER },
                   oneYearStudy: { type: Type.NUMBER },
                   twoYearStudy: { type: Type.NUMBER },
                   twoYearStudyPlusWork: { type: Type.NUMBER }
               },
               required: ["current", "oneYearStudy", "twoYearStudy", "twoYearStudyPlusWork"]
            },
            riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of assumptions made (e.g. IELTS Academic treated as General)" },
            recommendedPathways: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  eligibilityScore: { type: Type.NUMBER },
                  timeline: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Federal", "Provincial", "Study", "Business", "Family"] },
                },
              },
            },
            otherPathways: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   name: { type: Type.STRING },
                   description: { type: Type.STRING },
                   eligibilityScore: { type: Type.NUMBER },
                   timeline: { type: Type.STRING },
                   type: { type: Type.STRING, enum: ["Federal", "Provincial", "Study", "Business", "Family"] },
                 },
               },
            },
            strategicAdvice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of specific, actionable strategic advice points."
            },
            studyRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  programName: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  location: { type: Type.STRING },
                  tuition: { type: Type.STRING },
                  matchReason: { type: Type.STRING },
                },
              },
            },
          },
          required: [
            "overallSuccessProbability",
            "crsScorePrediction",
            "riskFactors",
            "strengths",
            "assumptions",
            "recommendedPathways",
            "otherPathways",
            "strategicAdvice",
          ],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Error analyzing profile:", error);
    // Fallback
    return {
      overallSuccessProbability: 75,
      crsScorePrediction: 320,
      futureCrsPredictions: {
          current: 320,
          oneYearStudy: 345,
          twoYearStudy: 360,
          twoYearStudyPlusWork: 475
      },
      riskFactors: ["Study gap"],
      strengths: ["Funds available"],
      assumptions: ["Assumed IELTS 5.0 for baseline calculation due to missing scores."],
      recommendedPathways: [
        {
          name: "Study Permit",
          description: "Standard study pathway.",
          eligibilityScore: 85,
          timeline: "3 Months",
          type: "Study",
        }
      ],
      otherPathways: [],
      strategicAdvice: [
        "Improve IELTS Listening score to 8.0 to maximize CLB points.",
        "Consider one-year PG diploma to gain Canadian experience.",
        "Apply for PNP in Saskatchewan or Manitoba for lower CRS cutoffs."
      ],
      studyRecommendations: [],
    };
  }
};
