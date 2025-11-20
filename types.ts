
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
  overallScore?: number; // New: Overall Band Score
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
  parentsInCanada?: boolean; // New: For PNP family streams
  spouse?: SpouseProfile;
  bringingDependents?: boolean;

  // Immigration Intent (New)
  immigrationCategory?: string; // 'Express Entry', 'PNP', etc.

  // Education
  educationLevel: string;
  hasCanadianEducation: boolean;
  hasEca?: boolean; // New: Educational Credential Assessment
  canadianEducationLevel?: string;
  gradesOrGpa?: string; // e.g., "75%", "3.5/4.0"

  // Field of Study & Preferences
  fieldOfStudy: string; // Current/Past field
  intendedStudyField: string; // What they want to study
  preferredProvinces: string[];
  
  // Work Experience
  workExperienceYears: number; // Total
  workExperienceLocation?: 'Inside Canada' | 'Outside Canada' | 'Both'; // New
  canadianWorkExperience: string; // 'None', '1', '2-3', '4-5+'
  foreignWorkExperience: string; // 'None', '1', '2-3', '4-5+'
  jobRole?: string; // New: For specific occupation targeting
  
  // Language
  englishScore: number; // General Band (Legacy/Fallback)
  languageDetails: LanguageScores;
  hasFrench?: boolean; // Keep for simple check logic
  frenchDetails?: LanguageScores; // New: Detailed French scores
  secondLanguageDetails?: LanguageScores;

  // Additional Factors
  certificateOfQualification: boolean; // Trade certificate
  targetProvince: string;
  savings: number; // CAD
  savingsExempt?: boolean; // New: If they have job offer/valid status
  
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

export interface CrsProjections {
  current: number;
  oneYearStudy: number; // Option 1
  twoYearStudy: number; // Option 2
  twoYearStudyPlusWork: number; // Option 3 (Highest)
}

export interface AIAnalysisResult {
  overallSuccessProbability: number; // 0-100
  crsScorePrediction: number;
  futureCrsPredictions?: CrsProjections; // New: For Student future scenarios
  riskFactors: string[];
  strengths: string[];
  assumptions?: string[]; // New: List of assumptions made during calculation
  recommendedPathways: Pathway[];
  otherPathways: Pathway[]; // Pathways evaluated but not top recommended
  strategicAdvice: string[]; // Changed to array for bullet points
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
