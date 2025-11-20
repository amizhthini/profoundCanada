
export enum UserType {
  Student = 'Student',
  Worker = 'Worker',
  Partner = 'Partner', // Consultant/Agency
  SuperAdmin = 'SuperAdmin' // Platform Owner
}

export interface LanguageScores {
  testType: string; // 'CELPIP-G', 'IELTS', 'PTE Core', 'TEF Canada', 'TCF Canada', 'None'
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
}

export interface SpouseProfile {
  isCanadian: boolean;
  comingToCanada: boolean;
  educationLevel: string;
  canadianWorkExperienceYears: string; // 'None', '1', '2-3', '4-5+'
  languageScores?: LanguageScores;
}

export interface UserProfile {
  name: string;
  age: number;
  
  // Personal & Family
  countryOfResidence: string;
  passportValid: boolean;
  maritalStatus: string; // 'Never Married', 'Married', 'Common-Law', 'Divorced', 'Separated', 'Widowed', 'Annulled'
  hasSiblingInCanada: boolean; // Citizen or PR > 18
  spouse?: SpouseProfile;
  bringingDependents?: boolean;

  // Education
  educationLevel: string;
  hasCanadianEducation: boolean;
  canadianEducationLevel?: string;
  gradesOrGpa?: string; // e.g., "75%", "3.5/4.0"

  // Field of Study & Preferences
  fieldOfStudy: string; // Current/Past field
  intendedStudyField: string; // What they want to study
  preferredProvinces: string[];
  
  // Work Experience
  workExperienceYears: number; // Total
  canadianWorkExperience: string; // 'None', '1', '2-3', '4-5+'
  foreignWorkExperience: string; // 'None', '1', '2-3', '4-5+'
  
  // Language
  englishScore: number; // General Band (Legacy/Fallback)
  languageDetails: LanguageScores;
  secondLanguageDetails?: LanguageScores;

  // Additional Factors
  certificateOfQualification: boolean; // Trade certificate
  targetProvince: string;
  savings: number; // CAD
  
  // Legal & History
  hasVisaHistory: boolean; // Previous travel/study in Canada
  hasRefusalHistory: boolean;
  hasCriminalRecord: boolean;
  hasMedicalCondition: boolean;
  
  // Job Offer
  hasJobOffer: boolean;
  jobOfferIsLmia?: boolean; // Supported by LMIA or Exempt
  jobOfferTeer?: string; // 'TEER 0', 'TEER 1-3', 'TEER 4-5'

  // PNP
  hasNominationCertificate: boolean;
}

export interface Pathway {
  name: string;
  description: string;
  eligibilityScore: number; // 0-100
  timeline: string;
  type: 'Federal' | 'Provincial' | 'Study' | 'Business' | 'Family';
}

export interface AIAnalysisResult {
  overallSuccessProbability: number; // 0-100
  crsScorePrediction: number;
  riskFactors: string[];
  strengths: string[];
  recommendedPathways: Pathway[];
  otherPathways: Pathway[]; // Pathways evaluated but not top recommended
  strategicAdvice: string;
  studyRecommendations?: {
    programName: string;
    institution: string;
    location: string;
    tuition: string;
    matchReason: string;
  }[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: 'New' | 'Consultation Booked' | 'In Progress' | 'Visa Approved';
  score: number;
  type: UserType;
  lastActive: string;
}

export interface PartnerOrganization {
  id: string;
  agencyName: string;
  contactPerson: string;
  email: string;
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Pending' | 'Suspended';
  clientCount: number;
  revenueGenerated: number;
}
