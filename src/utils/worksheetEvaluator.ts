import { OverallEvaluation, QuestionEvaluation, CaseEvaluation, StudentInfo, WorksheetAnswers } from '../types';
import { WORKSHEET_CASES } from '../data/worksheetData';

interface QuestionGradingRule {
  id: string;
  caseId: number;
  num: number;
  coreConcepts: string[];
  synonymGroups: string[][];
  minCharCountA: number;
  minCharCountB: number;
  feedbackTemplates: {
    A: string;
    B: string;
    C: string;
  };
}

const GRADING_RULES: Record<string, QuestionGradingRule> = {
  case1_q1: {
    id: 'case1_q1',
    caseId: 1,
    num: 1,
    coreConcepts: ['휠체어/장애 아동', '키즈카페 입장 제한', '국가인권위/인권 침해 판단'],
    synonymGroups: [
      ['휠체어', '장애 아동', '장애인', '장애 학생', '장애아'],
      ['키즈카페', '놀이시설', '카페', '입장 거부', '입장 제한', '이용 제한', '출입 제한', '막은'],
      ['국가인권위', '인권위', '인권위원회', '차별', '인권 침해', '평등권', '위헌', '시정']
    ],
    minCharCountA: 18,
    minCharCountB: 10,
    feedbackTemplates: {
      A: '기사의 핵심 사건(휠체어 아동의 키즈카페 입장 거부)과 국가인권위원회의 인권 침해 판단을 명확하고 완성도 높게 요약하였습니다.',
      B: '기사의 전반적인 내용을 잘 요약하였습니다. 국가인권위원회의 시정 권고 및 차별(인권 침해) 판단 사실을 함께 명시하면 더욱 완벽합니다.',
      C: '사례의 핵심 사실(장애 아동 입장 제한 사건과 인권 침해 판단)을 육하원칙에 맞추어 보완해 보세요.'
    }
  },
  case1_q2: {
    id: 'case1_q2',
    caseId: 1,
    num: 2,
    coreConcepts: ['평등권 침해', '합리적/정당한 이유 없는 차별 대우'],
    synonymGroups: [
      ['평등권', '평등', '차별받지 않을 권리', '평등권 침해'],
      ['합리적', '정당한', '이유 없는', '장애를 이유로', '장애 때문에', '부당한', '차별', '비장애인과 다르게', '불평등']
    ],
    minCharCountA: 25,
    minCharCountB: 12,
    feedbackTemplates: {
      A: '침해된 헌법상 기본권인 "평등권"을 정확히 제시하였고, 장애를 이유로 한 부당한 차별 대우라는 이유를 논리적으로 훌륭히 서술했습니다.',
      B: '인권 침해 이유를 잘 설명하였습니다. 헌법에 명시된 기본권의 정확한 명칭인 "평등권"을 명확히 명시해 주면 더 좋은 답안이 됩니다.',
      C: '침해된 기본권의 명칭(평등권)과 합리적 이유 없이 차별받은 이유를 구체적으로 작성해 보세요.'
    }
  },
  case1_q3: {
    id: 'case1_q3',
    caseId: 1,
    num: 3,
    coreConcepts: ['직접 시정 요구/대화', '국가인권위원회 진정(청원권)', '법원 소송(재판 청구권)'],
    synonymGroups: [
      ['시정 요구', '대화', '설득', '항의', '요청', '사장', '업체'],
      ['인권위', '국가인권위원회', '진정', '청원', '신고', '도움'],
      ['법원', '소송', '재판', '청구권', '고발', '손해배상', '법적']
    ],
    minCharCountA: 25,
    minCharCountB: 12,
    feedbackTemplates: {
      A: '키즈카페에 대한 직접적인 시정 요구부터 국가인권위원회 진정, 법원 소송 등 구제 조치(청구권)를 매우 다각적이고 구체적으로 제시했습니다.',
      B: '인권 침해에 대한 실질적인 구제 방안을 잘 제시했습니다. 국가인권위 진정이나 법원 소송 등 제도적 구제 방법도 함께 언급해 보세요.',
      C: '국가인권위원회 진정 넣기, 법원에 소송 제기하기 등 피해자가 활용할 수 있는 공적인 권리 구제 절차를 추가해 보세요.'
    }
  },
  case2_q1: {
    id: 'case2_q1',
    caseId: 2,
    num: 1,
    coreConcepts: ['미등록 외국인 부모', '출생신고 불가(그림자 아동)', '헌법재판소 위헌/제도 개선'],
    synonymGroups: [
      ['미등록', '외국인', '불법체류', '외국인 부모'],
      ['출생신고', '출생등록', '등록', '그림자 아동', '서류상', '주민등록번호'],
      ['헌법재판소', '헌재', '위헌', '인권', '보호', '제도']
    ],
    minCharCountA: 20,
    minCharCountB: 10,
    feedbackTemplates: {
      A: '부모의 신분으로 인해 출생신고를 하지 못하는 그림자 아동 문제와 헌법재판소의 결정 핵심을 탁월하게 요약했습니다.',
      B: '기사의 중요 내용을 잘 짚었습니다. "출생신고를 하지 못하는 문제"와 "헌법재판소의 위헌 결정" 내용을 연결하여 서술해 보세요.',
      C: '미등록 외국인 자녀가 겪는 출생 등록 제한과 헌법재판소의 결정 요지를 중심으로 다시 정리해 보세요.'
    }
  },
  case2_q2: {
    id: 'case2_q2',
    caseId: 2,
    num: 2,
    coreConcepts: ['사회권(건강권/교육받을 권리)', '천부인권/보편적 권리'],
    synonymGroups: [
      ['사회권', '건강권', '치료', '병원', '건강보험', '교육', '학교', '의무교육', '인간다운 생활'],
      ['천부인권', '보편적', '태어날 때부터', '모든 인간', '인간이라면', '국적과 상관없이', '누구나', '인권']
    ],
    minCharCountA: 30,
    minCharCountB: 15,
    feedbackTemplates: {
      A: '침해된 기본권인 사회권(건강권, 교육받을 권리)을 정확히 지적하고, 인권은 국적에 관계없이 모든 인간에게 부여된 보편적 권리(천부인권)라는 점을 완벽하게 설명했습니다.',
      B: '건강권 및 교육받을 권리 침해를 잘 파악했습니다. 인권이 왜 국적이나 부모의 신분과 무관하게 보장되어야 하는지(천부인권 개념)를 덧붙이면 더욱 훌륭합니다.',
      C: '병원 이용(건강권)이나 학교 입학(교육권) 등 침해된 권리와, 인간이라면 누구나 갖는 천부인권의 의미를 서술해 보세요.'
    }
  },
  case2_q3: {
    id: 'case2_q3',
    caseId: 2,
    num: 3,
    coreConcepts: ['보편적 출생등록제 도입', '의료/교육 기본권 보장 제도 개선'],
    synonymGroups: [
      ['보편적 출생등록', '출생등록', '출생신고', '법 개정', '제도 개선', '법과 제도', '등록할 권리'],
      ['의료', '치료', '병원', '건강보험', '교육', '학교', '지원', '혜택', '보호']
    ],
    minCharCountA: 25,
    minCharCountB: 12,
    feedbackTemplates: {
      A: '보편적 출생등록제 등 법·제도 개선 방향과 의료 및 교육 지원이라는 구체적인 국가·사회의 책무를 체계적으로 제시했습니다.',
      B: '국가와 사회가 실천해야 할 지원 방향을 잘 제시했습니다. 법과 제도의 개선(출생등록제 도입 등) 관점도 함께 포함해 보세요.',
      C: '국적과 관계없이 태어난 즉시 출생등록이 가능하도록 제도를 마련하고 최소한의 의료·교육을 지원하는 방안을 기술해 보세요.'
    }
  },
  case3_q1: {
    id: 'case3_q1',
    caseId: 3,
    num: 1,
    coreConcepts: ['교무실 청소 학생 배정 관행', '일반적 행동의 자유권 침해', '국가인권위 권고'],
    synonymGroups: [
      ['교무실', '교직원', '행정실', '사무실'],
      ['청소', '당번', '관행', '의무', '강제', '배정'],
      ['자유권', '행동의 자유', '일반적 행동', '인권 침해', '국가인권위', '인권위', '권고', '결정']
    ],
    minCharCountA: 20,
    minCharCountB: 10,
    feedbackTemplates: {
      A: '교직원 전용 공간의 청소를 학생에게 시키는 관행과 이에 대한 자유권 침해 판단을 정확하고 간결하게 요약했습니다.',
      B: '기사의 전반적인 취지를 잘 요약했습니다. 침해된 기본권인 "일반적 행동의 자유권" 개념을 포함하면 더욱 정확합니다.',
      C: '선생님 공간 청소 강제 관행과 국가인권위원회의 자유권 침해 판단 요지를 포함하여 한 문장으로 정리해 보세요.'
    }
  },
  case3_q2: {
    id: 'case3_q2',
    caseId: 3,
    num: 2,
    coreConcepts: ['일반적 행동의 자유권', '동의/자율성과 강제성', '교육적 목적과의 조화'],
    synonymGroups: [
      ['동의', '찬성', '반대', '생각'],
      ['일반적 행동', '행동의 자유', '자유권', '자유', '권리', '선택', '자율', '강제', '의사', '스스로'],
      ['선생님', '교직원', '업무 공간', '교육', '인성', '배려', '공동체']
    ],
    minCharCountA: 25,
    minCharCountB: 12,
    feedbackTemplates: {
      A: '자신의 입장을 명확히 밝히고, 일반적 행동의 자유권 또는 교육적 목적과 학생의 자율성 측면에서 매우 설득력 있는 논리를 펼쳤습니다.',
      B: '본인의 생각과 이유를 진솔하게 잘 서술했습니다. 자신의 행동을 스스로 결정할 권리인 "자유권" 관점을 보강해 보세요.',
      C: '동의 여부와 함께 왜 그렇게 생각하는지(자유권 침해 여부, 자발성 여부 등) 구체적인 이유를 작성해 보세요.'
    }
  },
  case3_q3: {
    id: 'case3_q3',
    caseId: 3,
    num: 3,
    coreConcepts: ['두발/복장 규제(개성표현의 자유)', '소지품/휴대전화 무단 검사(사생활 비밀과 자유)', '강제 자습/보충수업'],
    synonymGroups: [
      ['두발', '머리', '복장', '교복', '화장', '용모', '개성', '표현의 자유'],
      ['휴대폰', '휴대전화', '스마트폰', '소지품', '가방', '일기장', '검사', '사생활', '비밀'],
      ['자습', '보충수업', '야자', '강제', '참여', '체벌', '언어폭력', '기합']
    ],
    minCharCountA: 20,
    minCharCountB: 10,
    feedbackTemplates: {
      A: '두발·복장 규제(개성의 자유), 소지품 검사(사생활의 자유) 등 학교생활 속 다양한 인권 침해 사례를 매우 통찰력 있게 제시했습니다.',
      B: '학교 현장에서 겪을 수 있는 구체적 사례를 잘 떠올렸습니다. 해당 사례가 어떤 기본권(개성표현의 자유, 사생활의 자유 등)을 침해하는지 연결해 보세요.',
      C: '두발·복장 과도한 단속, 동의 없는 소지품 검사, 강제 자습 등 학교 속 오랜 관행 사례를 적어보세요.'
    }
  },
};

/**
 * Evaluates a single answer against model criteria and keywords
 */
export function evaluateSingleQuestion(
  questionId: string,
  questionNum: number,
  studentAnswer: string
): QuestionEvaluation {
  const rule = GRADING_RULES[questionId];
  const trimmed = (studentAnswer || '').trim();

  if (!rule || trimmed.length === 0) {
    return {
      questionId,
      questionNum,
      score: 0,
      grade: 'C',
      feedback: '답안이 작성되지 않았습니다. 모범답안과 안내를 참고하여 내용을 작성해 주세요.',
      keywordMatches: [],
      strengths: '작성 전입니다.',
      improvements: '해당 문항의 제시문과 핵심 키워드를 참고하여 답안을 서술해 보세요.',
    };
  }

  // 1. Calculate synonym group matches
  const matchedKeywords: string[] = [];
  let matchedGroupCount = 0;

  rule.synonymGroups.forEach((group) => {
    const foundWord = group.find((word) => trimmed.includes(word));
    if (foundWord) {
      matchedGroupCount++;
      matchedKeywords.push(foundWord);
    }
  });

  const groupMatchRate = matchedGroupCount / rule.synonymGroups.length;
  const charLength = trimmed.length;

  // 2. Determine grade & score
  let grade: 'A' | 'B' | 'C' = 'C';
  let score = 50;
  let strengths = '';
  let improvements = '';

  if (groupMatchRate >= 0.66 && charLength >= rule.minCharCountA) {
    grade = 'A';
    score = groupMatchRate === 1.0 && charLength >= rule.minCharCountA * 1.3 ? 100 : 92;
    strengths = '모범답안의 핵심 개념과 법적 근거가 매우 명확하고 논리정연하게 작성되었습니다.';
    improvements = '지금처럼 논리적이고 깊이 있는 서술 태도를 지속적으로 유지해 보세요.';
  } else if (groupMatchRate >= 0.33 || charLength >= rule.minCharCountB) {
    grade = 'B';
    score = groupMatchRate >= 0.5 ? 82 : 74;
    strengths = '사례의 기본 취지와 쟁점을 잘 이해하고 성실히 작성하였습니다.';
    improvements = '관련된 구체적인 헌법 기본권 명칭과 구제 방법을 모범답안과 대조하여 보완해 보세요.';
  } else {
    grade = 'C';
    score = charLength > 5 ? 60 : 40;
    strengths = '주어진 질문에 대해 답변을 시도하였습니다.';
    improvements = '제시문의 핵심 사건과 모범답안의 키워드를 꼼꼼히 확인하고 구체적인 문장으로 보강해 보세요.';
  }

  const feedback = rule.feedbackTemplates[grade];

  return {
    questionId,
    questionNum,
    score,
    grade,
    feedback,
    keywordMatches: matchedKeywords,
    strengths,
    improvements,
  };
}

/**
 * Evaluates the full worksheet completely in client-side (no API keys required).
 */
export function evaluateWorksheetLocally(
  studentInfo: StudentInfo,
  answers: WorksheetAnswers
): OverallEvaluation {
  const allQuestionEvaluations: QuestionEvaluation[] = [];
  const caseEvaluations: CaseEvaluation[] = [];

  WORKSHEET_CASES.forEach((cData) => {
    let caseScoreSum = 0;
    const caseQuestionEvals: QuestionEvaluation[] = [];

    cData.questions.forEach((q) => {
      const qKey = q.id as keyof WorksheetAnswers;
      const ans = answers[qKey] || '';
      const qEval = evaluateSingleQuestion(q.id, q.num, ans);
      caseQuestionEvals.push(qEval);
      allQuestionEvaluations.push(qEval);
      caseScoreSum += qEval.score;
    });

    const caseAvg = Math.round(caseScoreSum / cData.questions.length);
    let caseGrade: 'A' | 'B' | 'C' = 'C';
    if (caseAvg >= 85) caseGrade = 'A';
    else if (caseAvg >= 70) caseGrade = 'B';

    let caseSummaryFeedback = '';
    if (caseGrade === 'A') {
      caseSummaryFeedback = `${cData.title}에 대한 핵심 쟁점과 관련 헌법 기본권을 정확히 짚어 논리적으로 훌륭히 서술했습니다.`;
    } else if (caseGrade === 'B') {
      caseSummaryFeedback = `${cData.title}의 쟁점을 잘 파악하고 성실히 작성했습니다. 관련 기본권 명칭과 구제 방법을 더 구체화해 보세요.`;
    } else {
      caseSummaryFeedback = `${cData.title}의 제시문을 다시 정독하고 핵심 단어와 모범답안을 참고하여 보완해 보세요.`;
    }

    caseEvaluations.push({
      caseId: cData.id,
      caseTitle: cData.title,
      grade: caseGrade,
      score: caseAvg,
      questionEvaluations: caseQuestionEvals,
      summaryFeedback: caseSummaryFeedback,
    });
  });

  // Calculate overall score & grade
  const totalScoreSum = allQuestionEvaluations.reduce((sum, q) => sum + q.score, 0);
  const overallScore = Math.round(totalScoreSum / allQuestionEvaluations.length);

  const aCount = allQuestionEvaluations.filter((q) => q.grade === 'A').length;
  const bCount = allQuestionEvaluations.filter((q) => q.grade === 'B').length;

  let overallGrade: 'A' | 'B' | 'C' = 'C';
  if (overallScore >= 85 || aCount >= 6) {
    overallGrade = 'A';
  } else if (overallScore >= 68 || aCount + bCount >= 5) {
    overallGrade = 'B';
  } else {
    overallGrade = 'C';
  }

  // Generate comprehensive overall teacher feedback
  const studentName = studentInfo.name ? `${studentInfo.name} 학생` : '학생';
  let overallFeedback = '';

  if (overallGrade === 'A') {
    overallFeedback = `${studentName}은(는) 세 가지 인권 침해 언론 보도 사례의 핵심 쟁점을 정확히 파악하고, 평등권·사회권·일반적 행동의 자유권 등 관련 헌법상 기본권과 구제 절차(국가인권위원회 진정, 제도 개선 등)를 모범답안 수준으로 매우 논리적이고 깊이 있게 분석하였습니다. 인권 감수성과 비판적 사고력이 매우 탁월합니다.`;
  } else if (overallGrade === 'B') {
    overallFeedback = `${studentName}은(는) 일상 속 인권 침해 사례에 대한 높은 이해도를 바탕으로 전반적인 문항을 성실하고 충실하게 작성하였습니다. 각 사례에서 침해된 구체적인 기본권 명칭(평등권, 사회권 등)과 제도적 해결 방안을 모범답안을 참고하여 조금 더 명확하게 다듬는다면 더욱 뛰어난 답안이 될 것입니다.`;
  } else {
    overallFeedback = `${studentName}은(는) 인권 문제에 관심을 갖고 과제를 수행하였습니다. 아직 작성되지 않았거나 짧게 서술된 문항들에 대해 모범답안의 핵심 개념(평등권, 천부인권, 출생등록제, 자유권)을 확인하고 자신의 생각을 조금 더 구체적으로 보완해 보길 권장합니다.`;
  }

  return {
    overallGrade,
    overallScore,
    overallFeedback,
    caseEvaluations,
    evaluatedAt: new Date().toISOString(),
  };
}
