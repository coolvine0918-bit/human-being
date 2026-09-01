import React, { useState } from 'react';
import { CaseData, WorksheetAnswers } from '../types';
import { HelpCircle, Sparkles, Check, ChevronDown, ChevronUp, AlertCircle, Newspaper } from 'lucide-react';

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

  return (
    <div className="bg-white border-2 border-slate-300 rounded-xl shadow-xs overflow-hidden mb-8">
      {/* Case Header Banner */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded bg-blue-700 font-bold text-xs text-white tracking-wide">
            사례 {caseData.id}
          </span>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            {caseData.title}
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          언론 보도 사례 분석
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* [제시문 / 기사 자료] Paper Quote Box */}
        <div className="bg-slate-50 border border-slate-300 border-l-4 border-l-blue-900 rounded-r-lg p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide inline-flex items-center gap-1">
              <Newspaper className="w-3 h-3 text-slate-300" />
              제시문
            </span>
            <span className="text-xs text-slate-600 font-semibold">
              다음 기사를 꼼꼼히 읽고 관련 헌법 기본권 및 인권 문제를 탐구해 보세요.
            </span>
          </div>
          <p className="text-slate-800 text-sm sm:text-base leading-relaxed tracking-normal font-normal">
            {caseData.passage}
          </p>
        </div>

        {/* Questions List */}
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
                className="border border-slate-300 rounded-lg p-4 sm:p-5 bg-white transition-all focus-within:border-blue-800 focus-within:ring-1 focus-within:ring-blue-800"
              >
                {/* Question Title & Number */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold mt-0.5 shrink-0">
                      {q.num}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {q.questionText}
                      </h3>
                      {q.guidancePoint && (
                        <p className="mt-1.5 text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded px-2.5 py-1 inline-block font-medium">
                          💡 <strong>생각 열기:</strong> {q.guidancePoint}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Keyword Hint Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleKeywords(q.id)}
                    className="shrink-0 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-1 transition-colors"
                    title="핵심 개념 및 키워드 도움말 열기"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-800" />
                    <span>핵심 키워드</span>
                    {isExpandedHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Collapsible Keyword Hint */}
                {isExpandedHint && (
                  <div className="mb-3 p-3 bg-blue-50/70 border border-blue-200 rounded-md text-xs">
                    <div className="font-bold text-blue-950 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-800" />
                      <span>답안 작성에 도움되는 핵심 개념:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {q.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-blue-300 text-blue-900 px-2 py-0.5 rounded font-medium text-[11px]"
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
                    className="w-full bg-slate-50/50 border border-slate-300 rounded p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 leading-relaxed resize-y placeholder:text-slate-400 font-normal"
                    disabled={isSubmitted}
                  />

                  {/* Bottom Counter & Status */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-1">
                    <div className="flex items-center gap-2">
                      {hasAnswer ? (
                        <span className="flex items-center gap-1 text-blue-800 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          작성 중
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          답안을 입력해 주세요
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-500">
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
