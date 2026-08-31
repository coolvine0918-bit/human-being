export const GOOGLE_APPS_SCRIPT_SAMPLE = `/**
 * [일상 속 인권 침해 사례 분석 학습지] 구글 시트 자동 저장 스크립트
 * 
 * [배포 방법]
 * 1. Google 스프레드시트를 새로 생성합니다.
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고 이 코드를 그대로 붙여넣습니다.
 * 4. 우측 상단 [배포] -> [새 배포] 클릭
 * 5. 유형 선택: [웹 앱] 선택
 * 6. 설정:
 *    - 설명: 인권 학습지 제출 수신
 *    - 다음 사용자로 실행: 나(내 이메일)
 *    - 액세스 권한이 있는 사용자: [모든 사용자(Anyone)] (필수!)
 * 7. [배포] 버튼 클릭 후 생성된 [웹 앱 URL]을 복사하여 학습지 교사용 설정에 입력하세요.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트 헤더가 없는 경우 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["제출일시", "학번", "이름", "등급", "점수", "피드백"]);
      var headerRange = sheet.getRange(1, 1, 1, 6);
      headerRange.setBackground("#2563eb");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }
    
    var timestamp = data.submittedAt || Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    var studentId = data.studentId || "";
    var name = data.name || data.studentName || "";
    var grade = data.grade || "";
    var score = data.score !== undefined ? data.score : "";
    var feedback = data.feedback || "";
    
    // 새 행 추가 (학생 학번, 이름, 등급, 피드백)
    sheet.appendRow([timestamp, studentId, name, grade, score, feedback]);
    
    // 마지막 행 정렬
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 5).setHorizontalAlignment("center");
    sheet.getRange(lastRow, 6).setHorizontalAlignment("left");
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "성공적으로 구글 시트에 저장되었습니다.",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "인권 침해 사례 분석 학습지 Google Apps Script 웹 앱이 정상 동작 중입니다."
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
