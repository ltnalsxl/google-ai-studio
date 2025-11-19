export enum JobStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export enum ApplicationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  APPLIED = 'APPLIED',
  INTERVIEWING = 'INTERVIEWING',
  REJECTED = 'REJECTED',
  OFFER = 'OFFER',
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

export interface AnalysisResult {
  overallScore: number;
  fitLabel: 'High Fit' | 'Medium Fit' | 'Low Fit' | 'Overstretch';
  summary: string;
  categoryScores: CategoryScore[];
  levelFit: {
    label: string; // e.g., "Senior Level", "Entry Level"
    assessment: string; // e.g., "You are slightly underqualified for this Director role."
  };
  missingKeywords: string[];
  strongMatches: string[];
  tailoringGuide: TailoringSuggestion[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  status: JobStatus;
  applicationStatus: ApplicationStatus;
  result?: AnalysisResult;
  createdAt: number;
}

export interface ResumeData {
  fileName: string;
  content: string;
  lastUpdated: number;
}