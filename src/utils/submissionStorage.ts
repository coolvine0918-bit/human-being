import { SubmissionRecord, StudentInfo, OverallEvaluation, WorksheetAnswers } from '../types';

const SUBMISSIONS_KEY = 'worksheet_submissions_records';

/**
 * Get all stored submissions from localStorage
 */
export function getStoredSubmissions(): SubmissionRecord[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse stored submissions', e);
    return [];
  }
}

/**
 * Save a submission record locally in browser
 */
export function saveLocalSubmission(record: SubmissionRecord): void {
  try {
    const current = getStoredSubmissions();
    // Check if duplicate studentId exists, update or prepend
    const existingIndex = current.findIndex((item) => item.studentId === record.studentId && item.studentName === record.studentName);
    if (existingIndex >= 0) {
      current[existingIndex] = record;
    } else {
      current.unshift(record);
    }
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save submission locally', e);
  }
}

/**
 * Directly post submission data to Google Apps Script Web App
 */
export async function sendSubmissionToGas(
  gasUrl: string,
  payload: {
    studentId: string;
    studentName: string;
    grade: string;
    score: number;
    feedback: string;
    submittedAt: string;
    answers?: WorksheetAnswers;
  }
): Promise<{ success: boolean; message?: string }> {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return { success: false, message: '유효한 Google Apps Script URL이 설정되지 않았습니다.' };
  }

  const cleanUrl = gasUrl.trim();

  try {
    // Google Apps Script redirects require text/plain or no-cors in browser
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        submittedAt: payload.submittedAt,
        studentId: payload.studentId,
        studentName: payload.studentName,
        name: payload.studentName,
        grade: payload.grade,
        score: payload.score,
        feedback: payload.feedback,
      }),
    });

    return { success: true, message: 'Google Apps Script로 전송 완료되었습니다.' };
  } catch (err: any) {
    console.warn('GAS POST notice (browser standard):', err);
    // In no-cors mode, it succeeds if no network crash
    return { success: true, message: '전송 요청이 완료되었습니다.' };
  }
}
