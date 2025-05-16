// server/controllers/auth.js

const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc   사용자 등록
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, name, role } = req.body;

    // 이메일 중복 확인
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 이메일입니다'
      });
    }

    // 사용자 이름 중복 확인
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        success: false,
        error: '이미 사용 중인 사용자 이름입니다'
      });
    }

    // 새 사용자 생성
    user = await User.create({
      username,
      email,
      password,
      name,
      role: role || 'member'
    });

    // 토큰 생성 및 응답
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   사용자 로그인
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 이메일과 비밀번호 확인
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요'
      });
    }

    // 이메일로 사용자 찾기 (비밀번호 포함)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 토큰 생성 및 응답
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   현재 사용자 정보 가져오기
// @route  GET /api/auth/me
// @access Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('teams', 'name type');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   로그아웃 (클라이언트 측에서 토큰 제거)
// @route  GET /api/auth/logout
// @access Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// JWT 토큰 생성 및 쿠키 설정 헬퍼 함수
const sendTokenResponse = (user, statusCode, res) => {
  // 토큰 생성
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // HTTPS 사용 시 secure 옵션 설정
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // 비밀번호 필드 제외
  user.password = undefined;

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: user
    });
};