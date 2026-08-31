export interface StudentInfo {
  school: string;
  grade: string;
  classNum: string;
  studentNum: string;
  name: string;
}

export interface WorksheetAnswers {
  case1_q1: string;
  case1_q2: string;
  case1_q3: string;
  case2_q1: string;
  case2_q2: string;
  case2_q3: string;
  case3_q1: string;
  case3_q2: string;
  case3_q3: string;
}

export interface QuestionData {
  id: string; // e.g. "case1_q1"
  num: number;
  questionText: string;
  modelAnswer: string;
  keywords: string[];
  guidancePoint?: string;
  sampleAnswers?: { label: string; text: string }[];
}

export interface CaseData {
  id: number;
  title: string;
  passage: string;
  questions: QuestionData[];
}

export interface QuestionEvaluation {
  questionId: string;
  questionNum: number;
  grade: 'A' | 'B' | 'C';
  score: number; // 0 ~ 100
  keywordMatches: string[];
  feedback: string;
  strengths: string;
  improvements: string;
}

export interface CaseEvaluation {
  caseId: number;
  caseTitle: string;
  grade: 'A' | 'B' | 'C';
  score: number;
  questionEvaluations: QuestionEvaluation[];
  summaryFeedback: string;
}

export interface OverallEvaluation {
  overallGrade: 'A' | 'B' | 'C';
  overallScore: number;
  overallFeedback: string;
  caseEvaluations: CaseEvaluation[];
  evaluatedAt: string;
}

export interface SubmissionRecord {
  id: string;
  studentId: string; // e.g. "1학년 2반 15번"
  studentName: string;
  grade: 'A' | 'B' | 'C';
  score: number;
  feedback: string;
  submittedAt: string;
  answers: WorksheetAnswers;
  detailedEvaluation?: OverallEvaluation;
  syncedToGas?: boolean;
  gasResponse?: string;
}
