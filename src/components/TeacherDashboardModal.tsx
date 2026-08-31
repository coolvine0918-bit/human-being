import React, { useState, useEffect } from 'react';
import { SubmissionRecord } from '../types';
import { GOOGLE_APPS_SCRIPT_SAMPLE } from '../utils/gasCode';
import {
  X,
  Database,
  Copy,
  Check,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Code,
  Sparkles,
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
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
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
      message: 'Google Apps Script URL이 저장되었습니다. 학생 제출 시 자동 연동됩니다.',
    });
  };

  const handleTestGasConnection = async () => {
    if (!inputUrl.trim()) {
      setTestResult({
        success: false,
        message: 'Google Apps Script 웹 앱 URL을 먼저 입력해 주세요.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-gas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gasUrl: inputUrl.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: '연결 성공! 구글 시트에 테스트 행이 성공적으로 추가되었습니다.',
        });
        onSaveGasUrl(inputUrl.trim());
      } else {
        setTestResult({
          success: false,
          message: data.error || '연결에 실패했습니다. 배포 권한("모든 사용자")을 확인해 주세요.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: '연결 오류: ' + (e.message || '네트워크 상태를 확인해 주세요.'),
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D3128]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#E5E2D9] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D3128] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#3E4337]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7D8471] flex items-center justify-center text-white shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#FDFCF8]">교사용 관리 및 구글 시트 연동</h2>
              <p className="text-xs text-[#D8D4C7]">
                학생들의 학습지 제출 현황 확인 및 Google Apps Script 연동 설정
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#D8D4C7] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2D9] bg-[#F5F4EF] px-6 pt-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'submissions'
                ? 'border-[#7D8471] text-[#2D3128] bg-[#FDFCF8] rounded-t-lg'
                : 'border-transparent text-[#7D8471] hover:text-[#2D3128]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#7D8471]" />
            <span>제출 현황 및 등급표 ({submissions.length}명)</span>
          </button>
          <button
            onClick={() => setActiveTab('gasSetup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'gasSetup'
                ? 'border-[#7D8471] text-[#2D3128] bg-[#FDFCF8] rounded-t-lg'
                : 'border-transparent text-[#7D8471] hover:text-[#2D3128]'
            }`}
          >
            <Code className="w-4 h-4 text-[#7D8471]" />
            <span>Google Apps Script 연동 코드 & 가이드</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'submissions' ? (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#9A9587] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 학번, 등급 검색..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E2D9] rounded-lg focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471] text-[#2D3128]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={fetchSubmissions}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#E5E2D9] bg-white text-[#4A4F45] text-xs font-semibold hover:bg-[#F5F4EF] transition-colors shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#7D8471] hover:bg-[#6C7360] text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>엑셀/CSV 다운로드</span>
                  </button>
                </div>
              </div>

              {/* Submissions Table */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#E5E2D9] rounded-2xl bg-[#FAF9F5]">
                  <FileSpreadsheet className="w-10 h-10 text-[#9A9587] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#4A4F45]">아직 제출된 학습지가 없습니다.</p>
                  <p className="text-xs text-[#9A9587] mt-1">
                    학생이 학습지를 작성하고 제출하면 이곳에 [학번, 이름, 등급, 피드백]이 자동 집계됩니다.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E5E2D9] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F4EF] text-[#4A4F45] font-bold border-b border-[#E5E2D9]">
                      <tr>
                        <th className="py-2.5 px-3">학번</th>
                        <th className="py-2.5 px-3">이름</th>
                        <th className="py-2.5 px-3 text-center">등급</th>
                        <th className="py-2.5 px-3 text-center">점수</th>
                        <th className="py-2.5 px-3">피드백 요약</th>
                        <th className="py-2.5 px-3 text-center">제출 일시</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E2D9] bg-white">
                      {filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-2.5 px-3 font-medium text-[#2D3128] whitespace-nowrap">
                            {sub.studentId}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#2D3128] whitespace-nowrap">
                            {sub.studentName}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                sub.grade === 'A'
                                  ? 'bg-[#7D8471]/15 text-[#2D3128] border-[#7D8471]'
                                  : sub.grade === 'B'
                                  ? 'bg-[#BFA054]/20 text-[#5A4816] border-[#BFA054]'
                                  : 'bg-[#C27D60]/20 text-[#7A3E26] border-[#C27D60]'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#4A4F45]">
                            {sub.score}점
                          </td>
                          <td className="py-2.5 px-3 text-[#5A5A5A] max-w-xs truncate" title={sub.feedback}>
                            {sub.feedback}
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#9A9587] whitespace-nowrap">
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
              <div className="bg-[#F5F4EF] border border-[#E5E2D9] rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-[#2D3128] mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#7D8471]" />
                  <span>교사의 Google Apps Script 웹 앱 URL 등록</span>
                </h3>
                <p className="text-xs text-[#5A5A5A] mb-3 leading-relaxed">
                  Google Apps Script로 배포한 Web App URL(<code>https://script.google.com/macros/s/.../exec</code>)을 등록하면
                  학생 제출 시 [학번, 이름, 등급, 피드백]이 교사 구글 시트에 실시간 자동 행 추가됩니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 bg-white border border-[#E5E2D9] rounded-lg px-3 py-2 text-xs font-mono text-[#2D3128] focus:outline-none focus:border-[#7D8471] focus:ring-1 focus:ring-[#7D8471]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUrl}
                      className="px-3.5 py-2 bg-[#7D8471] hover:bg-[#6C7360] text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-2xs"
                    >
                      URL 저장
                    </button>
                    <button
                      onClick={handleTestGasConnection}
                      disabled={isTesting}
                      className="px-3.5 py-2 bg-white border border-[#7D8471] text-[#7D8471] hover:bg-[#F5F4EF] rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 shadow-2xs"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7D8471]" /> : null}
                      <span>연동 테스트</span>
                    </button>
                  </div>
                </div>

                {testResult && (
                  <div
                    className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-[#7D8471]/15 text-[#2D3128] border border-[#7D8471]'
                        : 'bg-[#C27D60]/20 text-[#7A3E26] border border-[#C27D60]'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-[#7D8471] shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#C27D60] shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Tutorial */}
              <div className="border border-[#E5E2D9] rounded-xl p-5 bg-white space-y-4">
                <h3 className="text-sm font-bold text-[#2D3128]">
                  📖 구글 시트 & Apps Script 배포 4단계 초간단 가이드
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2D9]">
                    <span className="font-bold text-[#7D8471] block mb-1">1단계: 스프레드시트 준비</span>
                    Google Drive에서 새 Google 스프레드시트를 만들고 상단 메뉴 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
                  </div>
                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2D9]">
                    <span className="font-bold text-[#7D8471] block mb-1">2단계: 코드 붙여넣기</span>
                    아래의 <strong>[코드 복사]</strong> 버튼을 눌러 복사한 뒤, Apps Script 편집기 내용 전체를 지우고 붙여넣습니다.
                  </div>
                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2D9]">
                    <span className="font-bold text-[#7D8471] block mb-1">3단계: 웹 앱으로 배포</span>
                    우측 상단 <strong>[배포] → [새 배포]</strong> 클릭 후 유형을 <strong>[웹 앱]</strong>으로 지정하고 액세스 권한을 <strong>[모든 사용자(Anyone)]</strong>로 설정합니다.
                  </div>
                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E5E2D9]">
                    <span className="font-bold text-[#7D8471] block mb-1">4단계: 웹 앱 URL 입력</span>
                    배포 완료 후 생성된 웹 앱 URL을 복사하여 위의 입력창에 붙여넣고 [URL 저장]을 누르면 완료됩니다.
                  </div>
                </div>

                {/* Code Snippet Box */}
                <div className="relative mt-3">
                  <div className="flex items-center justify-between bg-[#2D3128] text-[#D8D4C7] px-3.5 py-2 rounded-t-xl text-xs font-mono border-b border-[#3E4337]">
                    <span>Google Apps Script Code (Code.gs)</span>
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 bg-[#7D8471] hover:bg-[#6C7360] text-white px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold transition-colors shadow-2xs"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#D8D4C7]" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? '복사 완료!' : '원클릭 코드 복사'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-[#2D3128] text-[#E5E2D9] font-mono text-[11px] rounded-b-xl overflow-x-auto max-h-56 leading-relaxed">
                    {GOOGLE_APPS_SCRIPT_SAMPLE}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F5F4EF] border-t border-[#E5E2D9] px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#7D8471] hover:bg-[#6C7360] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
