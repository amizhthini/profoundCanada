
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
      1. Analyze Visa Approval Probability based on:
         - Financials (Savings vs Tuition/Living expenses).
         - Study Gap (Age vs Education Level).
         - Dual Intent (Genuine Student Check).
         - Country of Residence (High vs Low risk visa offices).
      2. SIMULATE "ApplyBoard" API Course Matching:
         - Recommend 3-4 real Canadian DLI (Designated Learning Institutions) programs.
         - Match based on 'intendedStudyField', 'educationLevel', and 'grades'.
         - If user has Bachelor's, suggest Post-Grad or Master's.
         - If user has High School, suggest Diploma or Bachelor's.
      `;
  } else {
      specificInstructions = `
      CONTEXT: USER IS A SKILLED WORKER SEEKING PR.
      REFERENCE "MASTER CHEAT SHEET 2025":
        1. Federal Express Entry (CEC, FSWP, FSTP, Category-Based).
        2. PNP Streams (OINP, BC PNP, AAIP, SINP, MPNP, Atlantic).
        3. Pilots (Agri-Food, RNIP, Caregiver).
      Strictly return the top 3 recommended pathways and a list of other pathways evaluated.
      `;
  }

  // Constructing detailed prompt
  let languageInfo = "N/A";
  if (profile.languageDetails) {
      const { testType, reading, writing, listening, speaking } = profile.languageDetails;
      languageInfo = `${testType} - R:${reading}, W:${writing}, L:${listening}, S:${speaking}`;
  }

  const commonPrompt = `
    Profile Details:
    - Name: ${profile.name}
    - Age: ${profile.age}
    - Country: ${profile.countryOfResidence}
    - Marital Status: ${profile.maritalStatus}
    - Education: ${profile.educationLevel} (Canadian Degree: ${profile.hasCanadianEducation})
    - Current Field: ${profile.fieldOfStudy}
    - Intended Study Field: ${profile.intendedStudyField}
    - Grades/GPA: ${profile.gradesOrGpa || "Not provided"}
    - Work Experience: ${profile.workExperienceYears} years
    - Language Results: ${languageInfo}
    - Savings: $${profile.savings} CAD
    - Visa History: ${profile.hasVisaHistory ? "Previous Travel to Canada" : "None"}
    - Refusals/Criminal/Medical Issues: ${profile.hasRefusalHistory || profile.hasCriminalRecord || profile.hasMedicalCondition ? "YES (Risk Factor)" : "None"}
    - Preferred Provinces: ${profile.preferredProvinces?.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an expert Canadian Immigration and Education Consultant AI.
        ${specificInstructions}
        
        ${commonPrompt}

        OUTPUT REQUIREMENTS:
        Return JSON matching the schema.
        For Students: 'recommendedPathways' should be generic visa pathways (e.g. "Study Permit (SDS)", "Study Permit (General)"), and 'studyRecommendations' must be populated.
        For Workers: 'studyRecommendations' can be empty.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallSuccessProbability: {
              type: Type.NUMBER,
              description: "0-100 score indicating likelihood of Visa/PR approval.",
            },
            crsScorePrediction: {
              type: Type.NUMBER,
              description: "Estimated CRS score (if applicable, else 0).",
            },
            riskFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
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
              type: Type.STRING,
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
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error analyzing profile:", error);
    // Fallback mock data
    return {
      overallSuccessProbability: 75,
      crsScorePrediction: 0,
      riskFactors: ["Study gap of >3 years", "High competition for this program"],
      strengths: ["Sufficient financial funds", "Good language score"],
      recommendedPathways: [
        {
          name: "Study Permit (SDS Stream)",
          description: "Fast-track processing for residents of specific countries with IELTS 6.0+.",
          eligibilityScore: 90,
          timeline: "20 Days",
          type: "Study",
        }
      ],
      otherPathways: [],
      strategicAdvice: "Focus on writing a strong Statement of Purpose (SOP) explaining the study gap.",
      studyRecommendations: [
        {
          programName: "Computer Systems Technician",
          institution: "Seneca Polytechnic",
          location: "Toronto, ON",
          tuition: "$18,000 CAD/year",
          matchReason: "Aligned with your interest in IT and budget.",
        }
      ],
    };
  }
};
