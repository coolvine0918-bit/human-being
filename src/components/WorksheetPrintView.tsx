import React from 'react';
import { OverallEvaluation, StudentInfo, WorksheetAnswers } from '../types';
import { WORKSHEET_CASES } from '../data/worksheetData';

interface WorksheetPrintViewProps {
  studentInfo: StudentInfo;
  answers: WorksheetAnswers;
  evaluation: OverallEvaluation | null;
}

export const WorksheetPrintView: React.FC<WorksheetPrintViewProps> = ({
  studentInfo,
  answers,
  evaluation,
}) => {
  return (
    <div id="printable-worksheet" className="hidden print:block print:p-6 bg-white text-black text-sm">
      {/* Worksheet Title Header */}
      <div className="text-center pb-4 mb-4 border-b-2 border-black">
        <h1 className="text-2xl font-serif font-bold tracking-tight mb-2">
          일상 속 인권 침해 사례 분석 학습지
        </h1>
        <div className="flex justify-between items-center text-sm font-medium mt-3 px-2">
          <span>{studentInfo.school || '궁내중학교'}</span>
          <span className="font-bold">
            {studentInfo.grade || '1'}학년 {studentInfo.classNum || ' '}반 {studentInfo.studentNum || ' '}번 이름: ({' '}
            {studentInfo.name || '        '} )
          </span>
          {evaluation && (
            <span className="border border-black px-2 py-0.5 font-bold">
              평가 등급: [{evaluation.overallGrade}] ({evaluation.overallScore}점)
            </span>
          )}
        </div>
        <p className="text-xs text-gray-700 mt-2 text-left">
          다음 세 가지 언론 보도 사례를 읽고, 질문에 답하며 우리 주변의 인권 침해 문제와 구제 방법에 대해 깊이 있게 생각해 봅시다.
        </p>
      </div>

      {/* Cases 1 to 3 */}
      {WORKSHEET_CASES.map((cData, cIdx) => (
        <div key={cData.id} className="mb-6 page-break-inside-avoid">
          <h2 className="text-base font-bold mb-1.5">{cData.title}</h2>

          {/* Passage Box */}
          <div className="border border-black p-2.5 mb-3 bg-gray-50 text-xs leading-relaxed">
            <span className="font-bold mr-1">[제시문]</span>
            {cData.passage}
          </div>

          {/* Questions Table */}
          <table className="w-full border-collapse border border-black text-xs">
            <tbody>
              {cData.questions.map((q) => {
                const qKey = q.id as keyof WorksheetAnswers;
                const studentAns = answers[qKey] || '';
                return (
                  <tr key={q.id} className="border-b border-black">
                    <td className="w-1/3 border-r border-black p-2 align-top bg-gray-50 font-semibold">
                      {q.num}. {q.questionText}
                    </td>
                    <td className="w-2/3 p-2 align-top min-h-[45px]">
                      <div className="whitespace-pre-wrap">{studentAns || '(작성 내용 없음)'}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {/* Teacher / AI Evaluation Summary if available */}
      {evaluation && (
        <div className="mt-4 border-2 border-black p-3 text-xs page-break-inside-avoid">
          <div className="font-bold mb-1">[교사 피드백 및 종합 평가]</div>
          <p className="leading-relaxed">{evaluation.overallFeedback}</p>
        </div>
      )}
    </div>
  );
};
