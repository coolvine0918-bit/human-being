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
  HelpCircle,
  FileCheck,
  Printer,
  ChevronRight,
  BookOpen,
  Scale,
  ShieldAlert,
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

  // Submit and Analyze with AI
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
      // 1. Call backend to analyze worksheet with Gemini
      const analyzeRes = await fetch('/api/analyze-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentInfo,
          answers,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success || !analyzeData.evaluation) {
        throw new Error(analyzeData.error || '답안 분석에 실패했습니다.');
      }

      const generatedEval: OverallEvaluation = analyzeData.evaluation;
      setEvaluation(generatedEval);

      // 2. Submit record to server and sync with Google Apps Script
      const submitRes = await fetch('/api/submit-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentInfo,
          answers,
          evaluation: generatedEval,
          gasUrl,
        }),
      });

      const submitData = await submitRes.json();
      setSyncedToGas(!!submitData.submission?.syncedToGas);
      setIsSubmitted(true);
      setIsEvaluationModalOpen(true);

      // 3. Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore confetti errors
      }

      showToast(submitData.message || '학습지 제출 및 채점이 완료되었습니다!', 'success');
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('제출 처리 중 문제가 발생했습니다: ' + err.message);
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
    showToast('예시 답안이 입력되었습니다. [학습지 채점 및 제출하기]를 눌러보세요.', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3D3D3D] flex flex-col selection:bg-[#7D8471]/20">
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
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 print:hidden">
        {/* Sample Answer Loader & Guide Callout */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#F5F4EF] border border-[#E5E2D9] rounded-xl px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#5A5A5A]">
            <Info className="w-4 h-4 text-[#7D8471] shrink-0" />
            <span>
              💡 답안 작성 시 <strong>[임시저장]</strong> 버튼을 누르면 언제든지 작성 내용을 안전하게 보관할 수 있습니다.
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadSampleAnswers}
            className="text-xs font-semibold text-[#7D8471] hover:text-[#2D3128] bg-white hover:bg-[#FAF9F5] border border-[#7D8471] rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs"
          >
            ✏️ 예시 모범 답안 채우기 (테스트용)
          </button>
        </div>

        {/* 3 Case Study Sections */}
        <div className="space-y-4">
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
        <div className="mt-8 bg-white border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 shadow-xs text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#7D8471]/15 text-[#7D8471] mb-1">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#2D3128]">
              학습지 작성을 모두 마치셨나요?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed">
              제출 버튼을 누르면 AI가 모범답안 및 핵심 키워드와 정밀 비교하여 <strong>A~C 등급</strong>과 상세 분석 피드백을 제공하며, 교사의 구글 시트에 자동으로 저장됩니다.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => saveDraft(true)}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#7D8471] bg-white hover:bg-[#FAF9F5] text-[#7D8471] font-semibold text-sm shadow-2xs transition-all active:scale-98"
              >
                <Save className="w-4 h-4 text-[#7D8471]" />
                <span>임시저장 하기</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-[#7D8471] hover:bg-[#6C7360] text-white font-semibold text-sm shadow-xs transition-all active:scale-98 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI 모범답안 비교 채점 및 제출 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FAF9F5]" />
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
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-[#2D3128] text-[#FDFCF8] border-[#3E4337]'
                : toast.type === 'warning'
                ? 'bg-[#BFA054] text-[#2D3128] border-[#9E823E]'
                : 'bg-[#4A4F45] text-white border-[#646A5E]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#7D8471] shrink-0" />
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
      <footer className="bg-[#2D3128] text-[#D8D4C7] text-xs py-6 border-t border-[#3E4337] text-center print:hidden">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-[#FDFCF8]">
            일상 속 인권 침해 사례 분석 온라인 학습지 시스템
          </p>
          <p className="text-[#9A9587] text-[11px]">
            궁내중학교 사회·도덕과 수행평가 활동지 | Gemini AI 자동 채점 및 Google Apps Script 연동
          </p>
        </div>
      </footer>
    </div>
  );
}
