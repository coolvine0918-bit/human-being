import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

interface SubmissionStore {
  id: string;
  studentId: string;
  studentName: string;
  grade: 'A' | 'B' | 'C';
  score: number;
  feedback: string;
  submittedAt: string;
  answers: Record<string, string>;
  detailedEvaluation?: any;
  syncedToGas?: boolean;
  gasResponse?: string;
}

const submissions: SubmissionStore[] = [];

// Initialize Gemini client lazily/safely
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API: Analyze Worksheet with Gemini AI
  app.post('/api/analyze-worksheet', async (req, res) => {
    try {
      const { studentInfo, answers } = req.body;

      if (!answers) {
        return res.status(400).json({ error: '답안이 전달되지 않았습니다.' });
      }

      const rubricPrompt = `
당신은 중학교 사회/도덕 과목 교사로서 '일상 속 인권 침해 사례 분석 학습지'를 평가하고 학생 맞춤형 피드백을 제공하는 AI 채점관입니다.
학생의 학번 및 이름: ${studentInfo?.school || '궁내중학교'} ${studentInfo?.grade || 1}학년 ${studentInfo?.classNum || ''}반 ${studentInfo?.studentNum || ''}번 ${studentInfo?.name || '학생'}

다음 3가지 사례와 9개 문항에 대해 학생의 작성 답안을 모범답안 및 채점 기준과 정밀 비교하여 평가하세요.
평가 기준(A~C 등급 및 100점 만점 점수):
- A등급 (우수: 85~100점): 핵심 기본권(평등권, 사회권, 청구권, 일반적 행동의 자유 등)과 핵심 키워드를 정확히 파악하고 논리적으로 서술함.
- B등급 (보통: 70~84점): 기본권을 대체로 이해하였으나 일부 키워드가 누락되거나 설명이 다소 미흡함.
- C등급 (노력요함: 0~69점): 기본권 오인, 단순 나열, 문항 의도 미파악 또는 내용이 현저히 부족함.

[사례 1: 휠체어 이용을 제한한 키즈카페]
제시문: 휠체어 이용 장애 아동 키즈카페 입장 제한 사건 -> 국가인권위 인권 침해 및 차별 시정 권고
문항1: 위 기사의 핵심 내용을 한 줄로 요약해 봅시다.
- 모범답안: 휠체어를 탄 장애 아동의 키즈카페 입장을 막은 것은 국가인권위원회에 의해 장애인 인권(평등권) 침해로 인정되었다.
- 키워드: 휠체어, 장애 아동, 키즈카페 입장 거부/제한, 국가인권위원회, 인권 침해/차별
- 학생 답안: "${answers.case1_q1 || ''}"

문항2: 헌법에 보장된 어떤 기본권이 침해되었으며, 왜 인권 침해라고 생각하나요?
- 모범답안: 평등권이 침해되었습니다. 합리적이고 정당한 이유 없이 '장애'를 이유로 다른 사람(비장애인)들과 다르게 부당한 차별 대우를 받았기 때문입니다. (지도 포인트: 막연한 자유권/행복추구권보다 '평등권' 도출)
- 키워드: 평등권, 합리적 이유 없는 차별, 장애로 인한 차별 대우
- 학생 답안: "${answers.case1_q2 || ''}"

문항3: 내가 이 아동의 보호자라면 이 인권 침해를 구제받기 위해 어떤 조치를 취할 수 있을까요?
- 모범답안: 먼저 키즈카페 사장님께 장애인 차별 금지에 대해 설명하며 시정을 요구하겠습니다. 해결되지 않으면 국가인권위원회에 진정을 넣거나(청원권), 법원에 소송(재판 청구권)을 제기할 수 있습니다. (지도 포인트: 일상적 대화/설득부터 국가인권위, 법원 소송 등 청구권까지)
- 키워드: 시정 요구/대화, 국가인권위원회 진정(청원권), 법원 소송(재판 청구권)
- 학생 답안: "${answers.case1_q3 || ''}"

[사례 2: 출생신고를 하지 못하는 '그림자 아동']
제시문: 미등록 외국인 부모의 자녀 출생신고 불가로 인한 의료/교육 사각지대 -> 헌법재판소 위헌 결정
문항1: 위 기사의 핵심 내용을 한 줄로 요약해 봅시다.
- 모범답안: 부모가 미등록 외국인이라는 이유로 출생신고를 못 해 인권을 보호받지 못하는 '그림자 아동' 문제에 대해 헌법재판소가 현행 제도의 문제를 지적했다.
- 키워드: 미등록 외국인 부모, 출생신고/등록 불가, 그림자 아동, 헌법재판소 위헌 결정
- 학생 답안: "${answers.case2_q1 || ''}"

문항2: 헌법에 보장된 어떤 기본권들이 침해되었으며, 이들의 인권을 보호해야 하는 이유는 무엇일까요?
- 모범답안: 건강보험 혜택을 못 받아 사회권(인간다운 생활을 할 권리, 건강권)이 침해되었고 학교에 못 가 사회권(교육을 받을 권리)도 침해됨. 인권은 태어날 때부터 부여된 보편적 권리(천부인권)이므로 국적/신분과 무관하게 동등하게 보호받아야 함.
- 키워드: 사회권 (인간다운 생활, 건강권, 교육받을 권리), 천부인권/보편적 인권
- 학생 답안: "${answers.case2_q2 || ''}"

문항3: 그림자 아동의 인권 보장을 위해 우리 사회와 국가는 어떤 노력을 해야 할까요?
- 모범답안: 부모 국적/체류자격과 무관하게 태어난 즉시 출생등록을 할 수 있도록 법과 제도를 개선해야 함. 최소한의 의료 지원과 교육 기회를 제공해야 함.
- 키워드: 보편적 출생등록제/법제도 개선, 의료 지원 및 교육 기회 보장
- 학생 답안: "${answers.case2_q3 || ''}"

[사례 3: 학생에게 배정된 교무실 청소]
제시문: 교무실/행정실 등 교직원 사용 공간을 학생 당번에게 청소시킨 관행 -> 국가인권위 인권(일반적 행동의 자유) 침해 판단 및 자율 해결 권고
문항1: 위 기사의 핵심 내용을 한 줄로 요약해 봅시다.
- 모범답안: 교무실 등 교직원이 쓰는 공간을 학생들에게 청소하도록 하는 학교의 오랜 관행은 학생의 자유권을 침해하는 것이라고 국가인권위원회가 결정했다.
- 키워드: 교무실 청소 당번 관행, 학생 인권 침해, 일반적 행동의 자유권 침해, 국가인권위 결정
- 학생 답안: "${answers.case3_q1 || ''}"

문항2: 학생들의 인권(기본권)이 침해되었다는 것에 동의하나요? 나의 생각을 적어봅시다.
- 모범답안: [동의] 교직원 공간을 억지로 청소하게 하는 것은 '일반적 행동의 자유권'을 침해함. [부분동의/반대] 공동체 규칙/책임감 배양 측면도 있으나 강제성 문제는 개선 필요. (지도 포인트: 일반적 행동의 자유 vs 교육적 목적 논리적 서술)
- 키워드: 일반적 행동의 자유권, 교육적 목적, 논리적 근거
- 학생 답안: "${answers.case3_q2 || ''}"

문항3: 학교생활 중 이와 비슷한 오랜 관행으로 인해 학생의 인권이 침해되는 또 다른 사례가 있다면?
- 모범답안: 두발/복장/화장 등 개성 표현의 자유 제한, 동의 없는 소지품/휴대전화 검사(사생활 비밀과 자유 침해), 강제 아침 자습/보충수업 참여 등
- 키워드: 두발/복장 규제, 소지품/휴대전화 검사, 강제 자습
- 학생 답안: "${answers.case3_q3 || ''}"

[피드백 작성 지침]
- 학생을 칭찬하고 격려하는 다정하고 전문적인 교사의 어투(~해요, ~했습니다)를 사용하세요.
- 설명 및 피드백은 2~3줄 내외로 간결하고 명료하게 핵심만 압축하여 작성하세요.
- 각 문항별로 등급(A/B/C), 매칭된 키워드 목록, 칭찬할 점(strengths), 보완할 점(improvements), 피드백 문장을 제공하세요.
- 전체 종합 등급(A/B/C), 종합 점수(0~100점), 교사 종합 피드백(overallFeedback)을 산출하세요.
`;

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: rubricPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallGrade: { type: Type.STRING, description: 'A, B, 또는 C' },
              overallScore: { type: Type.NUMBER, description: '0 to 100 overall score' },
              overallFeedback: { type: Type.STRING, description: '전체 학습지에 대한 종합 피드백 요약' },
              caseEvaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    caseId: { type: Type.NUMBER },
                    caseTitle: { type: Type.STRING },
                    grade: { type: Type.STRING, description: 'A, B, 또는 C' },
                    score: { type: Type.NUMBER },
                    summaryFeedback: { type: Type.STRING },
                    questionEvaluations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          questionId: { type: Type.STRING },
                          questionNum: { type: Type.NUMBER },
                          grade: { type: Type.STRING, description: 'A, B, 또는 C' },
                          score: { type: Type.NUMBER },
                          keywordMatches: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          feedback: { type: Type.STRING },
                          strengths: { type: Type.STRING },
                          improvements: { type: Type.STRING },
                        },
                        required: ['questionId', 'questionNum', 'grade', 'score', 'keywordMatches', 'feedback'],
                      },
                    },
                  },
                  required: ['caseId', 'caseTitle', 'grade', 'score', 'summaryFeedback', 'questionEvaluations'],
                },
              },
            },
            required: ['overallGrade', 'overallScore', 'overallFeedback', 'caseEvaluations'],
          },
        },
      });

      const rawJson = response.text || '{}';
      const parsedEvaluation = JSON.parse(rawJson);
      parsedEvaluation.evaluatedAt = new Date().toISOString();

      return res.json({ success: true, evaluation: parsedEvaluation });
    } catch (error: any) {
      console.error('Worksheet analysis error:', error);

      // Fallback rule-based evaluator if AI API has transient issue
      const fallbackEvaluation = generateRuleBasedEvaluation(req.body.answers);
      return res.json({
        success: true,
        evaluation: fallbackEvaluation,
        note: '평가 기준표 기반 자동 채점 결과입니다.',
      });
    }
  });

  // API: Submit student worksheet & send to Teacher's Google Apps Script
  app.post('/api/submit-worksheet', async (req, res) => {
    try {
      const { studentInfo, answers, evaluation, gasUrl } = req.body;

      const studentIdFormatted = `${studentInfo.school || '궁내중'} ${studentInfo.grade || '1'}학년 ${studentInfo.classNum || '0'}반 ${studentInfo.studentNum || '0'}번`;
      const studentName = studentInfo.name || '무명 학생';
      const grade = evaluation?.overallGrade || 'B';
      const score = evaluation?.overallScore || 80;
      const feedback = evaluation?.overallFeedback || '학습지 제출이 완료되었습니다.';

      const submissionRecord: SubmissionStore = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        studentId: studentIdFormatted,
        studentName,
        grade,
        score,
        feedback,
        submittedAt: new Date().toISOString(),
        answers: answers || {},
        detailedEvaluation: evaluation,
        syncedToGas: false,
      };

      // Target GAS endpoint: either from payload, or process.env.GAS_WEBAPP_URL
      const targetGasUrl = gasUrl || process.env.GAS_WEBAPP_URL;

      if (targetGasUrl && targetGasUrl.startsWith('http')) {
        try {
          const gasPayload = {
            studentId: studentIdFormatted,
            name: studentName,
            studentName: studentName,
            grade: grade,
            score: score,
            feedback: feedback,
            submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          };

          const gasResponse = await fetch(targetGasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gasPayload),
          });

          const gasResult = await gasResponse.text();
          submissionRecord.syncedToGas = true;
          submissionRecord.gasResponse = gasResult;
        } catch (gasError: any) {
          console.warn('GAS Sync warning:', gasError.message);
          submissionRecord.syncedToGas = false;
          submissionRecord.gasResponse = gasError.message;
        }
      }

      submissions.unshift(submissionRecord);

      return res.json({
        success: true,
        submission: submissionRecord,
        message: submissionRecord.syncedToGas
          ? '교사의 구글 시트에 성공적으로 저장되었습니다!'
          : '학습지가 제출되었습니다.',
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      res.status(500).json({ error: '제출 중 오류가 발생했습니다: ' + err.message });
    }
  });

  // API: Get submissions list (for Teacher View / Excel Export)
  app.get('/api/submissions', (req, res) => {
    res.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  });

  // API: Test Google Apps Script Webhook connection
  app.post('/api/test-gas', async (req, res) => {
    const { gasUrl } = req.body;
    if (!gasUrl || !gasUrl.startsWith('http')) {
      return res.status(400).json({ error: '올바른 Google Apps Script URL을 입력해 주세요.' });
    }

    try {
      const testPayload = {
        studentId: '궁내중 1학년 1반 99번(테스트)',
        name: '테스트 학생',
        studentName: '테스트 학생',
        grade: 'A',
        score: 95,
        feedback: '구글 시트 연동 테스트 완료 (정상 작동 확인)',
        submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      };

      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      const responseText = await response.text();
      return res.json({ success: true, gasResponse: responseText });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Google Apps Script 연결 실패: ' + err.message,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

function generateRuleBasedEvaluation(answers: Record<string, string> = {}) {
  // Simple heuristic grading if offline
  let totalScore = 0;
  const questionsCount = 9;

  const keyTerms: Record<string, string[]> = {
    case1_q1: ['휠체어', '키즈카페', '인권위', '국가인권위원회', '차별', '평등'],
    case1_q2: ['평등권', '차별', '장애'],
    case1_q3: ['시정', '인권위', '진정', '청원권', '소송', '재판', '청구권'],
    case2_q1: ['미등록', '출생신고', '그림자', '헌법재판소'],
    case2_q2: ['사회권', '건강권', '교육', '천부인권', '보편'],
    case2_q3: ['출생등록', '법', '제도', '의료', '교육'],
    case3_q1: ['교무실', '청소', '관행', '자유권', '인권위'],
    case3_q2: ['일반적 행동의 자유', '자유권', '의견', '교육'],
    case3_q3: ['두발', '복장', '휴대폰', '소지품', '자습'],
  };

  const questionEvaluations: Record<string, any> = {};

  for (const [qId, terms] of Object.entries(keyTerms)) {
    const ans = answers[qId] || '';
    const matches = terms.filter((term) => ans.includes(term));
    let score = 50;
    if (ans.length > 10) score += 20;
    score += Math.min(30, matches.length * 10);
    score = Math.min(100, Math.max(40, score));

    const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : 'C';
    totalScore += score;

    questionEvaluations[qId] = {
      questionId: qId,
      questionNum: parseInt(qId.slice(-1)),
      grade,
      score,
      keywordMatches: matches,
      feedback:
        grade === 'A'
          ? '모범답안의 핵심 개념과 주요 키워드를 충실하게 반영하여 논리적으로 서술했습니다.'
          : grade === 'B'
            ? '기본적인 개념을 잘 서술했으나, 핵심 기본권 명칭이나 구체적인 구제 수단을 조금 더 보완하면 완벽합니다.'
            : '모범답안의 핵심 키워드와 침해된 기본권의 정확한 개념을 다시 한 번 확인해 보세요.',
      strengths: matches.length > 0 ? `핵심 키워드 (${matches.join(', ')}) 활용 우수` : '성실한 작성 태도',
      improvements: grade === 'A' ? '훌륭한 답안입니다.' : '관련 헌법상 기본권 명칭과 구제 절차를 구체화해 보세요.',
    };
  }

  const avgScore = Math.round(totalScore / questionsCount);
  const overallGrade = avgScore >= 85 ? 'A' : avgScore >= 70 ? 'B' : 'C';

  return {
    overallGrade,
    overallScore: avgScore,
    overallFeedback: `인권 침해 사례와 헌법상 기본권 개념을 전반적으로 잘 분석하였습니다. 실생활 속에서 인권을 보호하고 구제하는 절차에 대해 깊이 있는 통찰을 보여주었습니다.`,
    caseEvaluations: [
      {
        caseId: 1,
        caseTitle: '사례 1: 휠체어 이용을 제한한 키즈카페',
        grade: questionEvaluations['case1_q2'].grade,
        score: Math.round((questionEvaluations['case1_q1'].score + questionEvaluations['case1_q2'].score + questionEvaluations['case1_q3'].score) / 3),
        summaryFeedback: '평등권 침해와 인권위 진정 등 구제 절차를 잘 파악했습니다.',
        questionEvaluations: [questionEvaluations['case1_q1'], questionEvaluations['case1_q2'], questionEvaluations['case1_q3']],
      },
      {
        caseId: 2,
        caseTitle: "사례 2: 출생신고를 하지 못하는 '그림자 아동'",
        grade: questionEvaluations['case2_q2'].grade,
        score: Math.round((questionEvaluations['case2_q1'].score + questionEvaluations['case2_q2'].score + questionEvaluations['case2_q3'].score) / 3),
        summaryFeedback: '사회권과 천부인권의 보편적 가치를 올바르게 짚어냈습니다.',
        questionEvaluations: [questionEvaluations['case2_q1'], questionEvaluations['case2_q2'], questionEvaluations['case2_q3']],
      },
      {
        caseId: 3,
        caseTitle: '사례 3: 학생에게 배정된 교무실 청소',
        grade: questionEvaluations['case3_q2'].grade,
        score: Math.round((questionEvaluations['case3_q1'].score + questionEvaluations['case3_q2'].score + questionEvaluations['case3_q3'].score) / 3),
        summaryFeedback: '일반적 행동의 자유권과 학교 내 인권 사례를 균형 있게 성찰했습니다.',
        questionEvaluations: [questionEvaluations['case3_q1'], questionEvaluations['case3_q2'], questionEvaluations['case3_q3']],
      },
    ],
    evaluatedAt: new Date().toISOString(),
  };
}

startServer();
