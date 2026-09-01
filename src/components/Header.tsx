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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-[11px] font-semibold border border-blue-700/50">
            사회·도덕과
          </span>
          <span className="text-slate-300 font-medium">인권 존중과 헌법 단원 탐구 활동지</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            {isSaving ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>임시저장 중...</span>
              </>
            ) : lastSavedTime ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>임시저장 완료 ({lastSavedTime})</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>자동 임시저장 활성화</span>
              </>
            )}
          </div>
          <button
            onClick={onOpenTeacherModal}
            className="flex items-center gap-1.5 text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border border-slate-700"
            title="교사용 구글 시트 연동 및 제출 현황"
          >
            <Settings className="w-3 h-3 text-slate-300" />
            <span>교사용 설정 및 시트 연동</span>
          </button>
        </div>
      </div>

      {/* Main Worksheet Title & Student Info Header */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="text-center mb-5 border-b-2 border-slate-900 pb-4">
          <div className="inline-flex items-center gap-1.5 text-blue-900 text-xs font-bold tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4 text-blue-800" />
            <span>주제별 인권 탐구 활동</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            일상 속 인권 침해 사례 분석 학습지
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            우리 주변에서 발생하는 인권 침해 사례를 찾고, 세 가지 언론 보도를 분석하며 인권 감수성을 키워봅시다.
          </p>
        </div>

        {/* School Worksheet Identification Form */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 sm:p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
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
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
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
                <span className="text-red-500 text-[10px]">*필수</span>
              </label>
              <input
                type="text"
                value={studentInfo.name}
                onChange={(e) => onStudentInfoChange('name', e.target.value)}
                placeholder="홍길동"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all"
              />
            </div>
          </div>

          {/* Progress & Save Actions Bar */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">작성 진행률:</span>
              <div className="w-28 sm:w-44 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-800 transition-all duration-300 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="font-extrabold text-blue-900">{completionRate}%</span>
              <span className="text-slate-500 text-[11px]">
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
    </header>
  );
};
