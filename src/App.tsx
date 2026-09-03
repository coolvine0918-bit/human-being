/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentInfo,
  WorksheetAnswers,
  OverallEvaluation,
  SubmissionRecord,
} from './types';
import {
  DEFAULT_STUDENT_INFO,
  INITIAL_ANSWERS,
  WORKSHEET_CASES,
} from './data/worksheetData';
import { evaluateWorksheetLocally } from './utils/worksheetEvaluator';
import { saveLocalSubmission, sendSubmissionToGas } from './utils/submissionStorage';
import { Header } from './components/Header';
import { WorksheetSection } from './components/WorksheetSection';
import { EvaluationResultModal } from './components/EvaluationResultModal';
import { TeacherDashboardModal } from './components/TeacherDashboardModal';
import { WorksheetPrintView } from './components/WorksheetPrintView';
import {
  Save,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Loader2,
  Info,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'human_rights_worksheet_draft_v1';
const GAS_URL_STORAGE_KEY = 'human_rights_worksheet_gas_url';

export default function App() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.studentInfo || DEFAULT_STUDENT_INFO;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STUDENT_INFO;
  });

  const [answers, setAnswers] = useState<WorksheetAnswers>(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return parsed.answers || INITIAL_ANSWERS;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ANSWERS;
  });

  const [gasUrl, setGasUrl] = useState<string>(() => {
    return localStorage.getItem(GAS_URL_STORAGE_KEY) || '';
  });

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState<OverallEvaluation | null>(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [syncedToGas, setSyncedToGas] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show Toast notification
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Save draft to localStorage
  const saveDraft = (manual = false) => {
    setIsSaving(true);
    try {
      const draftData = {
        studentInfo,
        answers,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(timeStr);

      if (manual) {
        showToast(`답안이 임시저장되었습니다. (${timeStr})`, 'success');
      }
    } catch (e) {
      console.error('Failed to save draft:', e);
      if (manual) {
        showToast('임시저장에 실패했습니다.', 'warning');
      }
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  // Auto-save debounced
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft(false);
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [studentInfo, answers]);

  // Handle student info change
  const handleStudentInfoChange = (field: keyof StudentInfo, value: string) => {
    setStudentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle answer change
  const handleAnswerChange = (questionId: keyof WorksheetAnswers, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Handle saving GAS URL
  const handleSaveGasUrl = (url: string) => {
    setGasUrl(url);
    localStorage.setItem(GAS_URL_STORAGE_KEY, url);
    showToast('교사용 Google Apps Script URL이 설정되었습니다.', 'success');
  };

  // Reset Answers
  const handleReset = () => {
    if (window.confirm('정말 작성 중인 답안을 모두 초기화하시겠습니까?')) {
      setAnswers(INITIAL_ANSWERS);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setLastSavedTime(null);
      setIsSubmitted(false);
      setEvaluation(null);
      showToast('답안이 초기화되었습니다.', 'info');
    }
  };

  // Calculate completion percentage
  const totalQuestions = 9;
  const answeredQuestions = Object.values(answers).filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  const completionRate = Math.round((answeredQuestions / totalQuestions) * 100);

  // Submit and Analyze with local criteria
  const handleSubmit = async () => {
    if (!studentInfo.name.trim()) {
      alert('학생 이름을 먼저 입력해 주세요.');
      document.querySelector('header input[placeholder="홍길동"]')?.parentElement?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (answeredQuestions < totalQuestions) {
      const confirmSubmit = window.confirm(
        `총 9개 문항 중 ${answeredQuestions}개만 작성되었습니다.\n아직 작성하지 않은 문항이 있습니다. 그대로 제출하고 채점을 받으시겠습니까?`
      );
      if (!confirmSubmit) return;
    }

    setIsAnalyzing(true);

    try {
      // 1. Instant local evaluation against model answers without API keys
      const generatedEval: OverallEvaluation = evaluateWorksheetLocally(studentInfo, answers);
      setEvaluation(generatedEval);

      // 2. Prepare student identification record
      const studentId = `${studentInfo.grade || '1'}${String(studentInfo.classNum || '1').padStart(2, '0')}${String(
        studentInfo.studentNum || '01'
      ).padStart(2, '0')}`;

      const submissionRecord: SubmissionRecord = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        studentId,
        studentName: studentInfo.name.trim(),
        school: studentInfo.school || '궁내중학교',
        grade: generatedEval.overallGrade,
        score: generatedEval.overallScore,
        feedback: generatedEval.overallFeedback,
        submittedAt: new Date().toISOString(),
        answers,
        evaluation: generatedEval,
        syncedToGas: false,
      };

      // 3. Save submission to localStorage
      saveLocalSubmission(submissionRecord);

      // 4. Send to Google Apps Script if URL configured
      let isGasSynced = false;
      if (gasUrl && gasUrl.trim()) {
        try {
          const gasRes = await sendSubmissionToGas(gasUrl, {
            studentId,
            studentName: studentInfo.name.trim(),
            grade: generatedEval.overallGrade,
            score: generatedEval.overallScore,
            feedback: generatedEval.overallFeedback,
            submittedAt: submissionRecord.submittedAt,
            answers,
          });
          isGasSynced = gasRes.success;
        } catch (gasErr) {
          console.warn('Google Apps Script sync notice:', gasErr);
        }
      }

      setSyncedToGas(isGasSynced);
      setIsSubmitted(true);
      setIsEvaluationModalOpen(true);

      // 5. Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }

      showToast('학습지 제출 및 채점이 완료되었습니다!', 'success');
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('제출 처리 중 문제가 발생했습니다: ' + (err.message || '다시 시도해 주세요.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick load sample answers for testing/preview
  const handleLoadSampleAnswers = () => {
    setStudentInfo({
      school: '궁내중학교',
      grade: '1',
      classNum: '2',
      studentNum: '14',
      name: '이지원',
    });
    setAnswers({
      case1_q1: '휠체어를 탄 장애 아동이 키즈카페 입장을 거부당하자 국가인권위원회가 이를 장애인 차별 및 평등권 침해로 판단했다.',
      case1_q2: '헌법에 보장된 평등권이 침해되었습니다. 정당한 사유 없이 장애가 있다는 이유로 비장애인 아동과 다르게 차별 대우를 받았기 때문입니다.',
      case1_q3: '먼저 키즈카페 측에 정당한 이유 없는 차별에 대해 시정을 요구하고, 해결되지 않을 경우 국가인권위원회에 진정을 넣거나 법원에 소송을 제기하여 구제받을 수 있습니다.',
      case2_q1: '부모가 미등록 외국인이라는 이유로 출생신고를 하지 못하는 그림자 아동 문제에 대해 헌법재판소가 위헌 결정을 내렸습니다.',
      case2_q2: '건강보험을 받지 못해 치료받을 권리(건강권)와 학교에 가지 못하는 교육을 받을 권리 등 사회권이 침해되었습니다. 인권은 모든 인간에게 보편적으로 부여된 천부인권이기 때문에 국적과 관계없이 보호되어야 합니다.',
      case2_q3: '모든 아동이 태어나자마자 즉시 등록될 수 있도록 보편적 출생등록제를 도입하고, 법과 제도를 개선하여 최소한의 의료와 교육 혜택을 제공해야 합니다.',
      case3_q1: '교직원이 사용하는 교무실 청소를 학생들에게 의무적으로 시키는 학교 관행은 학생들의 일반적 행동의 자유권을 침해한다는 국가인권위 결정이 있었습니다.',
      case3_q2: '동의합니다. 교무실은 선생님들의 사무 공간인데 학생의 자발적 의사 없이 강제로 청소시키는 것은 나의 행동을 스스로 결정할 자유권을 침해하기 때문입니다.',
      case3_q3: '두발이나 복장, 화장 등을 지나치게 규제하여 개성 표현의 자유를 침해하거나, 학생의 동의 없이 소지품이나 휴대폰을 검사하는 사생활 비밀 침해 사례가 있습니다.',
    });
    showToast('예시 모범 답안이 입력되었습니다. [학습지 채점 및 제출하기]를 눌러보세요.', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Top Header & Student Info Input */}
      <Header
        studentInfo={studentInfo}
        onStudentInfoChange={handleStudentInfoChange}
        onSaveDraft={() => saveDraft(true)}
        onReset={handleReset}
        onOpenTeacherModal={() => setIsTeacherModalOpen(true)}
        lastSavedTime={lastSavedTime}
        isSaving={isSaving}
        completionRate={completionRate}
      />

      {/* Main Worksheet Container */}
      <main className="max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 print:hidden">
        {/* Sample Answer Loader & Guide Callout */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-800 shrink-0" />
            <span>
              💡 답안 작성 중 <strong>[임시저장]</strong> 버튼을 누르면 언제든지 작성 내용을 안전하게 보관할 수 있습니다.
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadSampleAnswers}
            className="text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 border border-blue-300 rounded px-2.5 py-1.5 transition-colors shadow-xs"
          >
            ✏️ 예시 모범 답안 입력 (테스트용)
          </button>
        </div>

        {/* 3 Case Study Sections */}
        <div className="space-y-6">
          {WORKSHEET_CASES.map((caseData) => (
            <WorksheetSection
              key={caseData.id}
              caseData={caseData}
              answers={answers}
              onAnswerChange={handleAnswerChange}
              isSubmitted={isSubmitted}
            />
          ))}
        </div>

        {/* Bottom Submission Action Card */}
        <div className="mt-8 bg-white border-2 border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-900 mb-1 border border-blue-200">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              학습지 작성을 모두 마치셨나요?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              제출 버튼을 누르면 모범답안 및 핵심 개념 기준표와 정밀 비교하여 <strong>A~C 등급</strong>과 상세 분석 피드백을 제공하며, 제출 내용이 안전하게 저장됩니다.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => saveDraft(true)}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm shadow-xs transition-all active:scale-98"
              >
                <Save className="w-4 h-4 text-blue-800" />
                <span>임시저장 하기</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>모범답안 기준 비교 채점 및 제출 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>학습지 채점 및 제출하기</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Printable Sheet View (Hidden on screen, rendered when printing) */}
      <WorksheetPrintView
        studentInfo={studentInfo}
        answers={answers}
        evaluation={evaluation}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg border text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'warning'
                ? 'bg-amber-800 text-white border-amber-900'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Evaluation Result Modal */}
      <EvaluationResultModal
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
        evaluation={evaluation}
        studentInfo={studentInfo}
        answers={answers}
        onPrint={handlePrint}
        syncedToGas={syncedToGas}
      />

      {/* Teacher Dashboard & Google Apps Script Setup Modal */}
      <TeacherDashboardModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        gasUrl={gasUrl}
        onSaveGasUrl={handleSaveGasUrl}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 text-xs py-6 border-t border-slate-800 text-center print:hidden">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-white">
            일상 속 인권 침해 사례 분석 학습 활동지
          </p>
          <p className="text-slate-400 text-[11px]">
            중학교 사회·도덕과 인권 존중과 헌법 단원 활동지 | 모범답안 기준 비교 분석 및 구글 스프레드시트 연동
          </p>
        </div>
      </footer>
    </div>
  );
}
