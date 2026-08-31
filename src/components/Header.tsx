import React from 'react';
import { StudentInfo } from '../types';
import { Save, CheckCircle2, Clock, Settings, BookOpen, RotateCcw, Sparkles } from 'lucide-react';

interface HeaderProps {
  studentInfo: StudentInfo;
  onStudentInfoChange: (field: keyof StudentInfo, value: string) => void;
  onSaveDraft: () => void;
  onReset: () => void;
  onOpenTeacherModal: () => void;
  lastSavedTime: string | null;
  isSaving: boolean;
  completionRate: number;
}

export const Header: React.FC<HeaderProps> = ({
  studentInfo,
  onStudentInfoChange,
  onSaveDraft,
  onReset,
  onOpenTeacherModal,
  lastSavedTime,
  isSaving,
  completionRate,
}) => {
  return (
    <header className="bg-[#FDFCF8] border-b border-[#E5E2D9] sticky top-0 z-30 shadow-2xs">
      {/* Top Notification Bar */}
      <div className="bg-[#2D3128] text-[#E5E2D9] text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#3E4337]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#4A4F45] text-[#FDFCF8]">
            온라인 수행평가
          </span>
          <span className="text-[#D8D4C7]">중학교 사회·도덕과 인권 존중과 헌법 단원 분석 활동지</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#D8D4C7]">
            {isSaving ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#BFA054] animate-pulse"></span>
                <span>임시저장 중...</span>
              </>
            ) : lastSavedTime ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7D8471]" />
                <span>임시저장 완료 ({lastSavedTime})</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-[#9A9587]" />
                <span>자동 임시저장 활성화됨</span>
              </>
            )}
          </div>
          <button
            onClick={onOpenTeacherModal}
            className="flex items-center gap-1.5 text-[#FDFCF8] bg-[#4A4F45] hover:bg-[#5A6054] px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border border-[#646A5E]"
            title="교사용 구글 시트 연동 및 제출 현황"
          >
            <Settings className="w-3 h-3 text-[#D8D4C7]" />
            <span>교사용 설정/시트 연동</span>
          </button>
        </div>
      </div>

      {/* Main Worksheet Title & Student Info Form */}
      <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-[#7D8471] text-xs font-bold tracking-wider uppercase mb-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Human Rights Case Analysis Worksheet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3128] tracking-tight">
            일상 속 인권 침해 사례 분석 학습지
          </h1>
          <p className="mt-2 text-sm text-[#7D8471] max-w-2xl mx-auto leading-relaxed">
            우리 주변에서 발생하는 인권 침해 사례를 찾고, 세 가지 언론 보도를 분석하며 인권 감수성을 키워봅시다.
          </p>
        </div>

        {/* Student Identification Bar (School, Grade, Class, Number, Name) */}
        <div className="bg-[#F5F4EF] border border-[#E5E2D9] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
            {/* School */}
            <div className="sm:col-span-3 flex flex-col">
              <label className="text-[11px] uppercase tracking-wider text-[#9A9587] mb-1 font-semibold">
                학교
              </label>
              <input
                type="text"
                value={studentInfo.school}
                onChange={(e) => onStudentInfoChange('school', e.target.value)}
                placeholder="궁내중학교"
                className="w-full bg-white border border-[#E5E2D9] rounded-lg px-3 py-2 text-sm font-medium text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] transition-all"
              />
            </div>

            {/* Grade, Class, Number */}
            <div className="sm:col-span-5 grid grid-cols-3 gap-2.5">
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-wider text-[#9A9587] mb-1 font-semibold text-center">
                  학년
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={studentInfo.grade}
                    onChange={(e) => onStudentInfoChange('grade', e.target.value)}
                    placeholder="1"
                    className="w-full bg-white border border-[#E5E2D9] rounded-lg px-2 py-2 text-sm text-center font-medium text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-wider text-[#9A9587] mb-1 font-semibold text-center">
                  반
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={studentInfo.classNum}
                    onChange={(e) => onStudentInfoChange('classNum', e.target.value)}
                    placeholder="3"
                    className="w-full bg-white border border-[#E5E2D9] rounded-lg px-2 py-2 text-sm text-center font-medium text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] uppercase tracking-wider text-[#9A9587] mb-1 font-semibold text-center">
                  번호
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={studentInfo.studentNum}
                    onChange={(e) => onStudentInfoChange('studentNum', e.target.value)}
                    placeholder="15"
                    className="w-full bg-white border border-[#E5E2D9] rounded-lg px-2 py-2 text-sm text-center font-medium text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="sm:col-span-4 flex flex-col">
              <label className="text-[11px] uppercase tracking-wider text-[#9A9587] mb-1 font-semibold">
                이름<span className="text-[#C27D60] ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => onStudentInfoChange('name', e.target.value)}
                placeholder="홍길동"
                className="w-full bg-white border border-[#E5E2D9] rounded-lg px-3 py-2 text-sm font-semibold text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] transition-all"
              />
            </div>
          </div>

          {/* Quick Action Bar & Completion Status */}
          <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-[#4A4F45]">작성 진행률:</span>
              <div className="w-28 sm:w-44 bg-[#E5E2D9] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#7D8471] transition-all duration-300 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="font-bold text-[#2D3128]">{completionRate}%</span>
              <span className="text-[#9A9587]">
                ({Math.round((completionRate / 100) * 9)}/9 문항 작성)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSaveDraft}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#7D8471] text-[#7D8471] hover:bg-[#F5F4EF] font-semibold text-xs transition-all shadow-2xs active:scale-98"
                title="작성 중인 내용을 브라우저에 임시저장합니다"
              >
                <Save className="w-3.5 h-3.5 text-[#7D8471]" />
                <span>임시저장</span>
              </button>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[#9A9587] hover:text-[#4A4F45] hover:bg-[#EAE7DE] transition-colors text-xs"
                title="답안 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>초기화</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
