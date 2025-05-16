// server/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 인증 미들웨어
exports.protect = async (req, res, next) => {
  let token;

  // Authorization 헤더에서 토큰 확인
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Bearer 토큰에서 실제 토큰 부분만 추출
    token = req.headers.authorization.split(' ')[1];
  }

  // 토큰이 없는 경우
  if (!token) {
    return res.status(401).json({
      success: false,
      error: '이 라우트에 접근할 권한이 없습니다'
    });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증된 사용자 정보를 req.user에 저장
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: '이 라우트에 접근할 권한이 없습니다'
    });
  }
};

// 역할 기반 접근 제어 미들웨어
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '사용자 정보를 찾을 수 없습니다'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `'${req.user.role}' 역할은 이 작업을 수행할 권한이 없습니다`
      });
    }
    next();
  };
};

// 팀 멤버 확인 미들웨어
exports.checkTeamMembership = async (req, res, next) => {
  const teamId = req.params.teamId || req.params.id;
  
  // 관리자는 모든 팀에 접근 가능
  if (req.user.role === 'admin') {
    return next();
  }
  
  // 사용자가 팀에 속해 있는지 확인
  if (!req.user.teams.includes(teamId)) {
    return res.status(403).json({
      success: false,
      error: '이 팀에 접근할 권한이 없습니다'
    });
  }
  
  next();
};