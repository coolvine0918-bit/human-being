import React from 'react';
import { StudentInfo } from '../types';
import { Save, CheckCircle2, Clock, Settings, BookOpen, RotateCcw } from 'lucide-react';

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
    <div className="w-full">
      {/* 1. Ultra-Slim Top Utility Bar (Only this stays sticky: ~36px height, does not block tablet screen) */}
      <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-4 py-1.5 sm:py-2 sticky top-0 z-30 border-b border-slate-800 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 text-[10px] sm:text-[11px] font-semibold border border-blue-700/50 shrink-0">
            사회·도덕과
          </span>
          <span className="text-slate-300 font-medium text-xs truncate hidden xs:inline">
            인권 존중과 헌법 탐구
          </span>
          {studentInfo.name && (
            <span className="text-slate-400 text-xs font-normal border-l border-slate-700 pl-2 hidden sm:inline">
              작성자: <strong className="text-white font-semibold">{studentInfo.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Tablet Mini Progress indicator */}
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <span className="text-slate-400 hidden md:inline">진행률:</span>
            <span className="font-bold text-blue-400">{completionRate}%</span>
          </div>

          {/* Save Status indicator */}
          <div className="flex items-center gap-1 text-slate-300 text-[11px]">
            {isSaving ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="hidden sm:inline">저장 중...</span>
              </>
            ) : lastSavedTime ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{lastSavedTime}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">자동저장</span>
              </>
            )}
          </div>

          {/* Quick Save button in sticky bar for tablet convenience */}
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-blue-800 hover:bg-blue-700 text-white transition-colors"
            title="현재 작성 내용 즉시 임시저장"
          >
            <Save className="w-3 h-3 text-blue-200" />
            <span className="hidden xs:inline">저장</span>
          </button>

          <button
            onClick={onOpenTeacherModal}
            className="flex items-center gap-1 text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-[11px] font-medium transition-colors border border-slate-700"
            title="교사용 구글 시트 연동 및 제출 현황"
          >
            <Settings className="w-3 h-3 text-slate-300" />
            <span className="hidden md:inline">교사용 설정</span>
          </button>
        </div>
      </div>

      {/* 2. Main Title & Student Info Form (NOT sticky - naturally scrolls away so tablet screen has 100% room for passage) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
          {/* Title Header */}
          <div className="text-center mb-4 sm:mb-5 border-b-2 border-slate-900 pb-3 sm:pb-4">
            <div className="inline-flex items-center gap-1.5 text-blue-900 text-xs font-bold tracking-wider uppercase mb-1">
              <BookOpen className="w-4 h-4 text-blue-800" />
              <span>주제별 인권 탐구 활동</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              일상 속 인권 침해 사례 분석 학습지
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              우리 주변에서 발생하는 인권 침해 사례를 찾고, 세 가지 언론 보도를 분석하며 인권 감수성을 키워봅시다.
            </p>
          </div>

          {/* School Worksheet Identification Form (Scrolls with page) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 sm:p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-center">
              {/* School */}
              <div className="sm:col-span-3 flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-900 inline-block"></span>
                  학교명
                </label>
                <input
                  type="text"
                  value={studentInfo.school}
                  onChange={(e) => onStudentInfoChange('school', e.target.value)}
                  placeholder="궁내중학교"
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                />
              </div>

              {/* Grade, Class, Number */}
              <div className="sm:col-span-5 grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-700 mb-1 text-center">
                    학년
                  </label>
                  <input
                    type="text"
                    value={studentInfo.grade}
                    onChange={(e) => onStudentInfoChange('grade', e.target.value)}
                    placeholder="1"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-center font-medium text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-700 mb-1 text-center">
                    반
                  </label>
                  <input
                    type="text"
                    value={studentInfo.classNum}
                    onChange={(e) => onStudentInfoChange('classNum', e.target.value)}
                    placeholder="3"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-center font-medium text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[11px] font-bold text-slate-700 mb-1 text-center">
                    번호
                  </label>
                  <input
                    type="text"
                    value={studentInfo.studentNum}
                    onChange={(e) => onStudentInfoChange('studentNum', e.target.value)}
                    placeholder="15"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-center font-medium text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="sm:col-span-4 flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900 inline-block"></span>
                    성명
                  </span>
                  <span className="text-red-500 text-[10px] font-bold">*필수</span>
                </label>
                <input
                  type="text"
                  value={studentInfo.name}
                  onChange={(e) => onStudentInfoChange('name', e.target.value)}
                  placeholder="홍길동"
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
                />
              </div>
            </div>

            {/* Progress & Save Actions Bar */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-[11px] sm:text-xs">작성 진행률:</span>
                <div className="w-24 sm:w-40 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-800 transition-all duration-300 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <span className="font-extrabold text-blue-900">{completionRate}%</span>
                <span className="text-slate-500 text-[11px] hidden xs:inline">
                  ({Math.round((completionRate / 100) * 9)}/9 문항 완료)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSaveDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold text-xs transition-all shadow-xs active:scale-98"
                  title="작성 중인 내용을 브라우저에 임시저장합니다"
                >
                  <Save className="w-3.5 h-3.5 text-blue-800" />
                  <span>임시저장</span>
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors text-xs"
                  title="답안 초기화"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>초기화</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
