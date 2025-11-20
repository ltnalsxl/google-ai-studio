
export enum JobStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum ApplicationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  WISHLIST = 'WISHLIST',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  OFFER = 'OFFER',
}

export type ContextType = 'resume' | 'experience' | 'hobby' | 'value' | 'note';

export type Language = 'en' | 'ko';

export interface UserContextItem {
  id: string;
  type: ContextType;
  title: string; // e.g., "Master Resume", "Hiking Hobby", "My Design Philosophy"
  content: string;
  dateAdded: number;
  isActive: boolean; // New: Version control
}

export interface ResumeData {
  fileName: string;
  content: string;
  lastUpdated: number;
}

export interface CategoryScore {
  category: string; // e.g., "Hard Skills", "Experience", "Domain Knowledge"
  score: number; // 0-100
  reason: string;
}

export interface TailoringSuggestion {
  type: 'rewrite' | 'add' | 'keyword';
  suggestion: string;
  reason: string;
  example?: string;
}

export interface JDStructure {
  summary: string;
  responsibilities: string[];
  qualifications: string[];
  preferred: string[];
}

export interface AnalysisResult {
  overallScore: number;
  fitLabel: 'High Fit' | 'Medium Fit' | 'Low Fit' | 'Overstretch';
  summary: string;
  jdStructure: JDStructure; // Parsed JD sections
  categoryScores: CategoryScore[];
  levelFit: {
    label: string; // e.g., "Senior Level", "Entry Level"
    assessment: string; // e.g., "You are slightly underqualified for this Director role."
  };
  missingKeywords: string[];
  strongMatches: string[];
  tailoringGuide: TailoringSuggestion[];
  creativeConnections?: string[]; // New: Connecting dots between hobbies/values and JD
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  status: JobStatus;
  applicationStatus: ApplicationStatus;
  result?: AnalysisResult;
  tailoredResume?: string; 
  coverLetter?: string; 
  createdAt: number;
  usedContextSnapshot?: UserContextItem[]; // New: History of which context was used
}
