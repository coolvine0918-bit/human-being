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
  ArrowRight,
  TrendingUp,
  BookOpen,
  Send,
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
          bg: 'bg-[#7D8471]',
          text: 'text-[#4A4F45]',
          badge: 'bg-[#7D8471]/15 border-[#7D8471] text-[#2D3128]',
          label: 'A등급 (탁월함)',
        };
      case 'B':
        return {
          bg: 'bg-[#BFA054]',
          text: 'text-[#6B5720]',
          badge: 'bg-[#BFA054]/20 border-[#BFA054] text-[#5A4816]',
          label: 'B등급 (우수함)',
        };
      case 'C':
        return {
          bg: 'bg-[#C27D60]',
          text: 'text-[#7A3E26]',
          badge: 'bg-[#C27D60]/20 border-[#C27D60] text-[#7A3E26]',
          label: 'C등급 (노력요함)',
        };
      default:
        return {
          bg: 'bg-[#9A9587]',
          text: 'text-[#4A4F45]',
          badge: 'bg-[#EFECE5] border-[#D8D4C7] text-[#4A4F45]',
          label: '등급 산출',
        };
    }
  };

  const overallGradeStyle = getGradeColor(evaluation.overallGrade);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3128]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#E5E2D9] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-[#2D3128] text-white p-6 sm:p-8 relative border-b border-[#3E4337]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#D8D4C7] hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A4F45] border border-[#646A5E] text-[#D8D4C7] text-xs font-semibold mb-3">
                <FileCheck className="w-3.5 h-3.5 text-[#7D8471]" />
                <span>AI 모범답안 비교 분석 및 채점 결과표</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#FDFCF8] tracking-tight">
                {studentInfo.name || '학생'}의 학습지 채점 리포트
              </h2>
              <p className="text-[#D8D4C7] text-sm mt-1">
                {studentInfo.school} {studentInfo.grade}학년 {studentInfo.classNum}반 {studentInfo.studentNum}번
              </p>
            </div>

            {/* Overall Grade Display Badge */}
            <div className="flex flex-col items-center bg-[#4A4F45] border border-[#646A5E] rounded-2xl p-4 min-w-[140px] text-center shadow-xs">
              <span className="text-[11px] font-semibold text-[#D8D4C7] uppercase tracking-wider">최종 평가 등급</span>
              <div className="text-4xl sm:text-5xl font-black text-[#FDFCF8] my-1 tracking-tight">
                {evaluation.overallGrade}
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${overallGradeStyle.badge}`}>
                {overallGradeStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Google Sheets Sync Notification Banner */}
        <div className="bg-[#F5F4EF] border-y border-[#E5E2D9] px-6 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#4A4F45] font-medium">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7D8471] shrink-0" />
            <span>
              {syncedToGas
                ? '✅ 교사의 구글 스프레드시트에 [학번, 이름, 등급, 피드백]이 정상 기록되었습니다.'
                : '📋 학습지 제출 및 채점 결과가 시스템에 안전하게 저장되었습니다.'}
            </span>
          </div>
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1 bg-white hover:bg-[#FAF9F5] text-[#7D8471] border border-[#7D8471] px-3 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF 저장</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 max-h-[68vh] overflow-y-auto space-y-7">
          {/* Overall AI Feedback Summary */}
          <div className="bg-[#F5F4EF] border-l-4 border-[#7D8471] rounded-r-xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-[#2D3128] font-bold text-base mb-2">
              <Sparkles className="w-5 h-5 text-[#7D8471]" />
              <span>교사 종합 피드백</span>
            </div>
            <p className="text-[#3D3D3D] text-sm sm:text-base leading-relaxed">
              {evaluation.overallFeedback}
            </p>
          </div>

          {/* Case-by-Case Breakdown */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#2D3128] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#7D8471]" />
              <span>사례별 문항 분석 및 모범답안 비교</span>
            </h3>

            {WORKSHEET_CASES.map((cData) => {
              const caseEval = evaluation.caseEvaluations?.find((e) => e.caseId === cData.id);
              const caseGradeStyle = getGradeColor(caseEval?.grade || 'B');

              return (
                <div key={cData.id} className="border border-[#E5E2D9] rounded-xl overflow-hidden bg-white shadow-2xs">
                  {/* Case Subheader */}
                  <div className="bg-[#F5F4EF] border-b border-[#E5E2D9] px-4 py-3 flex items-center justify-between">
                    <h4 className="font-bold text-[#2D3128] text-sm sm:text-base">
                      {cData.title}
                    </h4>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${caseGradeStyle.badge}`}>
                      사례 평가: {caseEval?.grade || 'B'}등급
                    </span>
                  </div>

                  {/* Questions in this case */}
                  <div className="p-4 sm:p-5 space-y-5 divide-y divide-[#E5E2D9]">
                    {cData.questions.map((q) => {
                      const qKey = q.id as keyof WorksheetAnswers;
                      const studentAns = answers[qKey] || '(작성 내용 없음)';
                      const qEval = caseEval?.questionEvaluations?.find((qe) => qe.questionId === q.id);
                      const qGradeStyle = getGradeColor(qEval?.grade || 'B');

                      return (
                        <div key={q.id} className={q.num > 1 ? 'pt-5' : ''}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="font-bold text-[#2D3128] text-sm flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#7D8471] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {q.num}
                              </span>
                              <span>{q.questionText}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-md font-bold border shrink-0 ${qGradeStyle.badge}`}>
                              {qEval?.grade || 'B'}등급
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {/* Student Answer */}
                            <div className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg p-3">
                              <span className="text-[11px] font-bold text-[#7D8471] block mb-1">
                                ✍️ 내가 작성한 답안:
                              </span>
                              <p className="text-xs sm:text-sm text-[#3D3D3D] leading-relaxed">
                                {studentAns}
                              </p>
                            </div>

                            {/* Model Answer */}
                            <div className="bg-[#F5F4EF] border border-[#D8D4C7] rounded-lg p-3">
                              <span className="text-[11px] font-bold text-[#4A4F45] block mb-1">
                                🎯 모범 답안 (기준):
                              </span>
                              <p className="text-xs sm:text-sm text-[#2D3128] leading-relaxed">
                                {q.modelAnswer}
                              </p>
                            </div>
                          </div>

                          {/* Question Feedback & Keywords */}
                          <div className="mt-3 bg-[#EFECE5] border border-[#E5E2D9] rounded-lg p-3 text-xs">
                            <div className="font-semibold text-[#4A4F45] mb-1">
                              💬 문항 분석 및 보완점:
                            </div>
                            <p className="text-[#5A5A5A] leading-relaxed mb-2">
                              {qEval?.feedback || '모범답안의 핵심 키워드를 참고하여 논리적으로 서술해 보세요.'}
                            </p>
                            {qEval?.keywordMatches && qEval.keywordMatches.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[#7D8471] font-semibold">포함된 키워드:</span>
                                {qEval.keywordMatches.map((kw, kIdx) => (
                                  <span
                                    key={kIdx}
                                    className="bg-white border border-[#D8D4C7] text-[#4A4F45] px-2 py-0.5 rounded font-medium text-[11px]"
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
        <div className="bg-[#F5F4EF] border-t border-[#E5E2D9] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#9A9587]">
            평가 일시: {new Date(evaluation.evaluatedAt).toLocaleString('ko-KR')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#7D8471] text-[#7D8471] hover:bg-[#FAF9F5] text-sm font-semibold transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-[#7D8471]" />
              <span>학습지 출력</span>
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#7D8471] hover:bg-[#6C7360] text-white text-sm font-semibold shadow-2xs transition-colors"
            >
              <span>확인 완료</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
