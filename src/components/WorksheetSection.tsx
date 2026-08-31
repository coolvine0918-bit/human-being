import React, { useState } from 'react';
import { CaseData, WorksheetAnswers } from '../types';
import { HelpCircle, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

interface WorksheetSectionProps {
  caseData: CaseData;
  answers: WorksheetAnswers;
  onAnswerChange: (questionId: keyof WorksheetAnswers, value: string) => void;
  isSubmitted: boolean;
}

export const WorksheetSection: React.FC<WorksheetSectionProps> = ({
  caseData,
  answers,
  onAnswerChange,
  isSubmitted,
}) => {
  const [showKeywords, setShowKeywords] = useState<Record<string, boolean>>({});

  const toggleKeywords = (qId: string) => {
    setShowKeywords((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const getCaseBadgeColor = (id: number) => {
    switch (id) {
      case 1:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 2:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 3:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-2xl shadow-2xs overflow-hidden mb-8 transition-shadow hover:shadow-xs">
      {/* Case Header Banner */}
      <div className="bg-[#4A4F45] text-white px-5 py-4 flex items-center justify-between border-b border-[#3E4337]">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#7D8471] flex items-center justify-center font-bold text-xs text-white shadow-2xs">
            {caseData.id}
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#FDFCF8]">
            {caseData.title}
          </h2>
        </div>
        <span className="text-xs text-[#D8D4C7] font-medium hidden sm:inline-block">
          사례 분석 활동
        </span>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* [제시문] Box - Replicating Natural Tones case-card */}
        <div className="case-card shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#7D8471] text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide">
              [제시문]
            </span>
            <span className="text-xs text-[#7D8471] font-semibold">
              아래 기사를 정독하고 관련된 인권 침해 사실을 파악해 보세요.
            </span>
          </div>
          <p className="text-[#3D3D3D] text-sm sm:text-base leading-relaxed tracking-normal font-normal">
            {caseData.passage}
          </p>
        </div>

        {/* Questions Grid / Table */}
        <div className="space-y-5">
          {caseData.questions.map((q) => {
            const questionKey = q.id as keyof WorksheetAnswers;
            const currentAnswer = answers[questionKey] || '';
            const charCount = currentAnswer.trim().length;
            const hasAnswer = charCount > 0;
            const isExpandedHint = showKeywords[q.id];

            return (
              <div
                key={q.id}
                className="border border-[#E5E2D9] rounded-xl p-4 sm:p-5 bg-[#FAF9F5] transition-all focus-within:border-[#7D8471] focus-within:ring-1 focus-within:ring-[#7D8471] focus-within:bg-white"
              >
                {/* Question Title & Number */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7D8471] text-white text-xs font-bold mt-0.5 shrink-0">
                      {q.num}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#2D3128] leading-snug">
                        {q.questionText}
                      </h3>
                      {q.guidancePoint && (
                        <p className="mt-1.5 text-xs text-[#7D8471] bg-[#EFECE5] border border-[#E5E2D9] rounded-lg px-2.5 py-1 inline-block">
                          💡 <strong>생각 열기:</strong> {q.guidancePoint}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Keyword Hint Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleKeywords(q.id)}
                    className="shrink-0 text-xs font-medium text-[#7D8471] hover:text-[#2D3128] bg-white hover:bg-[#F5F4EF] border border-[#E5E2D9] rounded-lg px-2.5 py-1 flex items-center gap-1 transition-colors shadow-2xs"
                    title="핵심 개념 및 키워드 도움말 열기"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#7D8471]" />
                    <span>핵심 키워드</span>
                    {isExpandedHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Collapsible Keyword Hint */}
                {isExpandedHint && (
                  <div className="mb-3 p-3.5 bg-[#EFECE5] border border-[#E5E2D9] rounded-xl text-xs animate-fadeIn">
                    <div className="font-semibold text-[#4A4F45] mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7D8471]" />
                      <span>답안 작성에 도움되는 핵심 단어:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {q.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#D8D4C7] text-[#4A4F45] px-2.5 py-0.5 rounded-md font-medium text-[11px]"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student Answer Textarea */}
                <div className="relative mt-2">
                  <textarea
                    id={`textarea-${q.id}`}
                    value={currentAnswer}
                    onChange={(e) => onAnswerChange(questionKey, e.target.value)}
                    placeholder={`해당 사례가 왜 인권 침해인지, 어떤 권리가 침해되었는지 구체적으로 서술하세요...`}
                    rows={q.num === 1 ? 2 : 3}
                    className="w-full bg-white border border-[#E5E2D9] rounded-lg p-3.5 text-sm text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] leading-relaxed resize-y placeholder:text-[#9A9587]"
                    disabled={isSubmitted}
                  />

                  {/* Bottom Counter & Status */}
                  <div className="flex items-center justify-between text-xs text-[#9A9587] mt-1.5 px-1">
                    <div className="flex items-center gap-2">
                      {hasAnswer ? (
                        <span className="flex items-center gap-1 text-[#7D8471] font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          작성 중
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#C27D60]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          답안을 입력해 주세요
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[#9A9587]">
                      {charCount}자 작성
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
