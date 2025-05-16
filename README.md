동아리 팀 주간 트래커 웹 서비스
동아리나 스터디 팀의 주간 활동을 체계적으로 관리하고 추적할 수 있는 웹 애플리케이션입니다. 팀원들의 활동과 기여도를 효과적으로 관리하고, 팀 진행 상황을 시각화하여 보여줍니다.
주요 기능
1. 대시보드

사용자 역할에 따른 맞춤형 대시보드
팀별 진행 상황 요약
마감이 임박한 보고서 알림
전체 완료율 통계

2. 팀 관리

팀 생성 및 편집
팀원 추가/제거
팀별 보고서 진행 상황 확인

3. 주간 보고서

템플릿 기반 주간 보고서 작성
실시간 저장 기능
마감일 알림 설정

4. 통계 및 분석

팀별 완료율 비교
주차별 진행 추이
멤버별 기여도 분석

5. 알림 시스템

마감일 임박 알림
보고서 제출 알림
댓글 및 피드백 알림

기술 스택

프론트엔드: React, React Router, Axios, Styled Components
백엔드: Express.js, MongoDB, Mongoose
인증: JWT
기타: Chart.js (데이터 시각화), date-fns (날짜 관리)

프로젝트 구조
team-tracker/
├── client/                 # 리액트 프론트엔드
│   ├── public/
│   └── src/
│       ├── components/     # UI 컴포넌트
│       ├── pages/          # 페이지 컴포넌트
│       ├── context/        # 리액트 컨텍스트
│       ├── hooks/          # 커스텀 훅
│       ├── services/       # API 서비스
│       ├── utils/          # 유틸리티 함수
│       └── App.js          # 메인 앱 컴포넌트
├── server/                 # Express 백엔드
│   ├── controllers/        # 컨트롤러
│   ├── models/             # 데이터 모델
│   ├── routes/             # API 라우트
│   ├── middleware/         # 미들웨어
│   ├── config/             # 설정 파일
│   └── server.js           # 메인 서버 파일
└── package.json            # 프로젝트 메타데이터
설치 및 실행 방법
1. 저장소 클론
git clone https://github.com/username/team-tracker.git
cd team-tracker
2. 패키지 설치
npm run install-all
이 명령은 루트, 클라이언트, 서버 디렉토리의 모든 패키지를 한 번에 설치합니다.
3. 환경 변수 설정
server/.env 파일을 만들고 다음 내용을 입력합니다:
PORT=5000
MONGO_URI=mongodb://localhost:27017/team-tracker
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
4. 애플리케이션 실행
npm start
이 명령은 백엔드 서버(5000번 포트)와 프론트엔드 개발 서버(3000번 포트)를 동시에 실행합니다.
주요 API 엔드포인트
인증 관련

POST /api/auth/register - 회원가입
POST /api/auth/login - 로그인
GET /api/auth/me - 현재 사용자 정보

팀 관련

GET /api/teams - 모든 팀 목록
POST /api/teams - 새 팀 생성
GET /api/teams/:id - 특정 팀 정보
PUT /api/teams/:id - 팀 정보 업데이트
DELETE /api/teams/:id - 팀 삭제
POST /api/teams/:id/members - 팀원 추가
DELETE /api/teams/:id/members/:userId - 팀원 제거

주간 보고서 관련

GET /api/reports - 모든 보고서 목록
GET /api/teams/:teamId/reports - 특정 팀의 보고서 목록
POST /api/teams/:teamId/reports - 새 보고서 생성
GET /api/reports/:id - 특정 보고서 정보
PUT /api/reports/:id - 보고서 업데이트
DELETE /api/reports/:id - 보고서 삭제

기여도 관련

GET /api/reports/:reportId/contributions - 보고서의 기여도 목록
POST /api/reports/:reportId/contributions - 기여도 추가
PUT /api/contributions/:id - 기여도 업데이트
DELETE /api/contributions/:id - 기여도 삭제

사용자 역할 및 권한

Admin: 모든 팀과 보고서에 완전한 접근 권한
Leader: 자신이 생성한 팀 관리, 팀원 추가/제거 가능
Member: 자신이 속한 팀의 보고서 작성 및 수정 가능

개발 상태
현재 이 프로젝트는 기본적인 프레임워크와 기능이 구현된 상태입니다. 추가 개발 계획:

알림 시스템 구현 (이메일, 실시간 알림)
팀 활동 통계 및 분석 대시보드 개선
댓글 및 피드백 기능 추가
모바일 UI/UX 개선
파일 첨부 기능 구현

라이센스
MIT License