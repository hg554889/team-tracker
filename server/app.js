const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 라우트 임포트
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const reportRoutes = require('./routes/reports');
const contributionRoutes = require('./routes/contributions');

// 앱 초기화
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// 데이터베이스 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB 연결 성공!'))
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err.message);
    process.exit(1);
  });

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contributions', contributionRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('동아리 팀 주간 트래커 API 서버');
});

// 포트 설정
const PORT = process.env.PORT || 5000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});

// 예기치 않은 에러 처리
process.on('unhandledRejection', (err) => {
  console.log('처리되지 않은 거부:', err.message);
  server.close(() => process.exit(1));
});