## Slack 클론 코딩
#### 인프런 강의 [Slack 클론 코딩[실시간 채팅 with React]](https://www.inflearn.com/course/클론코딩-실시간채팅)을 듣고 학습한 내용
회원가입, 로그인, 워크스페이스 및 각종 워크스페이스 기능(생성, 초대, 채널 생성 및 초대), 실시간 채팅 및 온라인 사용자 리스트 구현

![스크린샷 2023-09-01 오후 4 54 40](https://github.com/klloo/react-ts-slack-clonecoding-sleact/assets/53117014/cd73b231-de59-4ed8-971d-a1eaa51e997b)


### 사용 기술 스택
- [x] React
- [x] SWR
- [x] Socket.io
- [x] Emotion
- [x] TypeScript
- [x] Webpack + Babel

<br/>

### 사용 라이브러리
- `gravatar`: 랜덤 프로필 생성 
- `socket.io-client@2`: 서버와 프론트 간 소켓 통신 
- `react-custom-scrollbars`: 스크롤바 커스터마이징
- `react-mentions`: @누구 이런 방식의 멘션 기능
- `react-toastify`: 경고 알림창
- `regexify-string`: 정규식 표현 사용

<br/>

### 실행 방법
#### 클라이언트
경로 ./alecture
```
$npm install
$npm run dev
```
#### 서버
경로 ./back
```
// 1. db 생성
$ npm install
$ npx sequelize db:create // .env 생성 후 실행

// 2. workspace & channel 데이터 생성
$ npx sequelize db:seed:all
$ npm run dev
```
