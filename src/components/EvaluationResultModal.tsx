import React from 'react';
import { OverallEvaluation, StudentInfo, WorksheetAnswers } from '../types';
import { WORKSHEET_CASES } from '../data/worksheetData';
import {
  Award,
  CheckCircle,
  FileCheck,
  Printer,
  X,
  Sparkles,
  BookOpen,
  Database,
} from 'lucide-react';

interface EvaluationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: OverallEvaluation | null;
  studentInfo: StudentInfo;
  answers: WorksheetAnswers;
  onPrint: () => void;
  syncedToGas: boolean;
}

export const EvaluationResultModal: React.FC<EvaluationResultModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  studentInfo,
  answers,
  onPrint,
  syncedToGas,
}) => {
  if (!isOpen || !evaluation) return null;

  const getGradeColor = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A':
        return {
          bg: 'bg-blue-900',
          text: 'text-blue-900',
          badge: 'bg-blue-900 text-white border-blue-950 shadow-xs',
          label: 'A등급 (탁월함)',
        };
      case 'B':
        return {
          bg: 'bg-slate-700',
          text: 'text-slate-800',
          badge: 'bg-slate-700 text-white border-slate-800 shadow-xs',
          label: 'B등급 (우수함)',
        };
      case 'C':
        return {
          bg: 'bg-slate-500',
          text: 'text-slate-700',
          badge: 'bg-slate-500 text-white border-slate-600 shadow-xs',
          label: 'C등급 (노력요함)',
        };
      default:
        return {
          bg: 'bg-slate-600',
          text: 'text-slate-800',
          badge: 'bg-slate-100 border-slate-300 text-slate-800',
          label: '등급 산출',
        };
    }
  };

  const overallGradeStyle = getGradeColor(evaluation.overallGrade);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-blue-300 text-xs font-bold mb-3">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>모범답안 비교 분석 및 채점 결과표</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {studentInfo.name || '학생'}의 학습지 채점 리포트
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                {studentInfo.school} {studentInfo.grade}학년 {studentInfo.classNum}반 {studentInfo.studentNum}번
              </p>
            </div>

            {/* Overall Grade Display Badge */}
            <div className="flex flex-col items-center bg-slate-800 border border-slate-700 rounded-xl p-4 min-w-[140px] text-center shadow-xs">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">최종 평가 등급</span>
              <div className="text-4xl sm:text-5xl font-black text-white my-1 tracking-tight">
                {evaluation.overallGrade}
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${overallGradeStyle.badge}`}>
                {overallGradeStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Google Sheets Sync Notification Banner */}
        <div className="bg-slate-100 border-b border-slate-300 px-6 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-700 font-medium">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-800 shrink-0" />
            <span>
              {syncedToGas
                ? '✅ 교사의 구글 스프레드시트에 [학번, 이름, 등급, 피드백]이 정상 기록되었습니다.'
                : '📋 학습지 제출 및 채점 결과가 시스템에 안전하게 저장되었습니다.'}
            </span>
          </div>
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1 rounded text-xs font-bold transition-colors shrink-0 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-800" />
            <span>인쇄 / PDF 저장</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[68vh] overflow-y-auto space-y-7 bg-slate-50/50">
          {/* Overall Teacher Feedback Summary */}
          <div className="bg-white border border-slate-300 border-l-4 border-l-blue-900 rounded-r-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-2">
              <Sparkles className="w-5 h-5 text-blue-800" />
              <span>교사 종합 피드백</span>
            </div>
            <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
              {evaluation.overallFeedback}
            </p>
          </div>

          {/* Case-by-Case Breakdown */}
          <div className="space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-800" />
              <span>사례별 문항 분석 및 모범답안 비교</span>
            </h3>

            {WORKSHEET_CASES.map((cData) => {
              const caseEval = evaluation.caseEvaluations?.find((e) => e.caseId === cData.id);
              const caseGradeStyle = getGradeColor(caseEval?.grade || 'B');

              return (
                <div key={cData.id} className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                  {/* Case Subheader */}
                  <div className="bg-slate-100 border-b border-slate-300 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {cData.title}
                    </h4>
                    <span className={`text-xs px-2.5 py-1 rounded font-bold border ${caseGradeStyle.badge}`}>
                      사례 평가: {caseEval?.grade || 'B'}등급
                    </span>
                  </div>

                  {/* Questions in this case */}
                  <div className="p-4 sm:p-5 space-y-5 divide-y divide-slate-200">
                    {cData.questions.map((q) => {
                      const qKey = q.id as keyof WorksheetAnswers;
                      const studentAns = answers[qKey] || '(작성 내용 없음)';
                      const qEval = caseEval?.questionEvaluations?.find((qe) => qe.questionId === q.id);
                      const qGradeStyle = getGradeColor(qEval?.grade || 'B');

                      return (
                        <div key={q.id} className={q.num > 1 ? 'pt-5' : ''}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="font-bold text-slate-900 text-sm flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {q.num}
                              </span>
                              <span>{q.questionText}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold border shrink-0 ${qGradeStyle.badge}`}>
                              {qEval?.grade || 'B'}등급
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {/* Student Answer */}
                            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3">
                              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                                ✍️ 내가 작성한 답안:
                              </span>
                              <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
                                {studentAns}
                              </p>
                            </div>

                            {/* Model Answer */}
                            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3">
                              <span className="text-[11px] font-bold text-blue-950 block mb-1">
                                🎯 모범 답안 (기준):
                              </span>
                              <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
                                {q.modelAnswer}
                              </p>
                            </div>
                          </div>

                          {/* Question Feedback & Keywords */}
                          <div className="mt-3 bg-slate-100 border border-slate-200 rounded-lg p-3 text-xs">
                            <div className="font-bold text-slate-800 mb-1">
                              💬 문항 분석 및 피드백:
                            </div>
                            <p className="text-slate-700 leading-relaxed mb-2">
                              {qEval?.feedback || '모범답안의 핵심 키워드를 참고하여 논리적으로 서술해 보세요.'}
                            </p>
                            {qEval?.keywordMatches && qEval.keywordMatches.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-blue-900 font-bold">포함된 핵심 개념:</span>
                                {qEval.keywordMatches.map((kw, kIdx) => (
                                  <span
                                    key={kIdx}
                                    className="bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px]"
                                  >
                                    ✓ {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            평가 일시: {new Date(evaluation.evaluatedAt).toLocaleString('ko-KR')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-blue-900" />
              <span>학습지 출력</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold shadow-xs transition-colors"
            >
              <span>확인 완료</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
