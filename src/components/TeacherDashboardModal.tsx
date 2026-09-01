import React, { useState, useEffect } from 'react';
import { SubmissionRecord } from '../types';
import { GOOGLE_APPS_SCRIPT_SAMPLE } from '../utils/gasCode';
import { getStoredSubmissions, sendSubmissionToGas } from '../utils/submissionStorage';
import {
  X,
  Database,
  Copy,
  Check,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Code,
} from 'lucide-react';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  onSaveGasUrl: (url: string) => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  onClose,
  gasUrl,
  onSaveGasUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'gasSetup'>('submissions');
  const [inputUrl, setInputUrl] = useState(gasUrl);
  const [isCopied, setIsCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setInputUrl(gasUrl);
  }, [gasUrl]);

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      // 1. Get from localStorage (works 100% on Netlify and offline)
      const localData = getStoredSubmissions();
      setSubmissions(localData);

      // 2. Optional try fetch if running in fullstack dev
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
            setSubmissions(data.submissions);
          }
        }
      } catch {
        // purely client mode
      }
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SAMPLE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    onSaveGasUrl(inputUrl.trim());
    setTestResult({
      success: true,
      message: '구글 시트 연동 URL이 저장되었습니다. 학생이 제출할 때마다 자동으로 전송됩니다.',
    });
  };

  const handleTestGasConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({
        success: false,
        message: '구글 앱스 스크립트 웹 앱 URL을 먼저 입력해 주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      await sendSubmissionToGas(inputUrl.trim(), {
        studentId: '10199',
        studentName: '테스트학생',
        grade: 'A',
        score: 100,
        feedback: '구글 스프레드시트 자동 기록 정상 연동 테스트',
        submittedAt: new Date().toISOString(),
      });

      setTestResult({
        success: true,
        message: '연동 테스트 신호가 전송되었습니다. 선생님의 구글 시트 첫 번째 행을 확인해 보세요!',
      });
      onSaveGasUrl(inputUrl.trim());
    } catch (e: any) {
      setTestResult({
        success: false,
        message: '연결 확인 중 오류가 발생했습니다: ' + (e.message || '네트워크 상태를 확인해 주세요.'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportCsv = () => {
    if (submissions.length === 0) {
      alert('내보낼 제출 내역이 없습니다.');
      return;
    }

    const headers = ['제출일시', '학번', '이름', '등급', '점수', '피드백'];
    const rows = submissions.map((s) => [
      `"${s.submittedAt ? new Date(s.submittedAt).toLocaleString('ko-KR') : ''}"`,
      `"${s.studentId}"`,
      `"${s.studentName}"`,
      `"${s.grade}"`,
      s.score,
      `"${(s.feedback || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `인권학습지_제출명단_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-800 flex items-center justify-center text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">교사용 관리 및 구글 시트 연동</h2>
              <p className="text-xs text-slate-300">
                학생들의 학습지 제출 현황 확인 및 구글 스프레드시트 연동 설정
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-300 bg-slate-100 px-6 pt-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-blue-900 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-800" />
            <span>제출 현황 및 등급표 ({submissions.length}명)</span>
          </button>
          <button
            onClick={() => setActiveTab('gasSetup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'gasSetup'
                ? 'border-blue-900 text-blue-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4 text-blue-800" />
            <span>구글 스프레드시트 연동 가이드 및 코드</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-slate-50/50">
          {activeTab === 'submissions' ? (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 학번, 등급 검색..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={fetchSubmissions}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>엑셀/CSV 다운로드</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-white">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">아직 제출된 학습지가 없습니다.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    학생이 학습지를 작성하고 제출하면 이곳에 [학번, 이름, 등급, 피드백]이 자동 집계됩니다.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="py-2.5 px-3">학번</th>
                        <th className="py-2.5 px-3">이름</th>
                        <th className="py-2.5 px-3 text-center">등급</th>
                        <th className="py-2.5 px-3 text-center">점수</th>
                        <th className="py-2.5 px-3">피드백 요약</th>
                        <th className="py-2.5 px-3 text-center">제출 일시</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                            {sub.studentId}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {sub.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded font-bold text-[11px] border ${
                                sub.grade === 'A'
                                  ? 'bg-blue-900 text-white border-blue-950'
                                  : sub.grade === 'B'
                                  ? 'bg-slate-700 text-white border-slate-800'
                                  : 'bg-slate-500 text-white border-slate-600'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                            {sub.score}점
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={sub.feedback}>
                            {sub.feedback}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500 whitespace-nowrap">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString('ko-KR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Google Apps Script Setup Guide & URL Config */
            <div className="space-y-6">
              {/* Webhook URL Input Bar */}
              <div className="bg-white border border-slate-300 rounded-lg p-4 sm:p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-900" />
                  <span>교사용 구글 스프레드시트 웹 앱 URL 등록</span>
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  구글 시트의 Apps Script로 배포한 웹 앱 URL(<code>https://script.google.com/macros/s/.../exec</code>)을 등록해 두시면
                  학생이 제출할 때마다 [학번, 이름, 등급, 피드백]이 선생님 구글 시트에 실시간으로 자동 추가됩니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUrl}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
                    >
                      URL 저장
                    </button>
                    <button
                      onClick={handleTestGasConnection}
                      disabled={isTesting}
                      className="px-3.5 py-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-900" /> : null}
                      <span>연동 테스트</span>
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-800 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Tutorial */}
              <div className="border border-slate-300 rounded-lg p-5 bg-white space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  📖 구글 시트 연동 4단계 가이드
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">1단계: 스프레드시트 생성</span>
                    Google Drive에서 새 Google 스프레드시트를 만들고 상단 메뉴 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">2단계: 코드 붙여넣기</span>
                    아래의 <strong>[원클릭 코드 복사]</strong> 버튼을 눌러 복사한 뒤, 편집기 내용 전체를 지우고 붙여넣습니다.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">3단계: 웹 앱으로 배포</span>
                    우측 상단 <strong>[배포] → [새 배포]</strong> 클릭 후 유형을 <strong>[웹 앱]</strong>으로 지정하고 액세스 권한을 <strong>[모든 사용자(Anyone)]</strong>로 설정합니다.
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-900 block mb-1">4단계: 웹 앱 URL 등록</span>
                    배포 완료 후 표시되는 웹 앱 URL을 복사하여 위의 입력창에 붙여넣고 [URL 저장]을 누르면 완료됩니다.
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div className="relative mt-3">
                  <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-3.5 py-2 rounded-t-lg text-xs font-mono border-b border-slate-800">
                    <span>구글 앱스 스크립트 배포 코드 (Code.gs)</span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 bg-blue-800 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[11px] font-sans font-bold transition-colors shadow-xs"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-slate-200" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? '복사 완료!' : '원클릭 코드 복사'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-b-lg overflow-x-auto max-h-56 leading-relaxed">
                    {GOOGLE_APPS_SCRIPT_SAMPLE}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded transition-colors shadow-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

