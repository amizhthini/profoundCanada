export enum UserType {
  Student = 'Student',
  Worker = 'Worker',
  Partner = 'Partner', // Consultant/Agency
  SuperAdmin = 'SuperAdmin' // Platform Owner
}

export interface UserProfile {
  name: string;
  age: number;
  educationLevel: string;
  fieldOfStudy: string;
  workExperienceYears: number;
  englishScore: number; // IELTS equivalent
  targetProvince: string;
  savings: number; // CAD
  hasJobOffer: boolean;
}

export interface Pathway {
  name: string;
  description: string;
  eligibilityScore: number; // 0-100
  timeline: string;
  type: 'Federal' | 'Provincial' | 'Study';
}

export interface AIAnalysisResult {
  overallSuccessProbability: number; // 0-100
  crsScorePrediction: number;
  riskFactors: string[];
  strengths: string[];
  recommendedPathways: Pathway[];
  strategicAdvice: string;
  studyRecommendations?: {
    programName: string;
    institution: string;
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