// server/routes/auth.js

const express = require('express');
const { check } = require('express-validator');
const { register, login, getCurrentUser, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 회원가입 라우트
router.post(
  '/register',
  [
    check('username', '사용자 이름은 필수입니다').not().isEmpty(),
    check('email', '유효한 이메일을 입력해주세요').isEmail(),
    check('password', '비밀번호는 6자 이상이어야 합니다').isLength({ min: 6 }),
    check('name', '이름은 필수입니다').not().isEmpty()
  ],
  register
);

// 로그인 라우트
router.post(
  '/login',
  [
    check('email', '유효한 이메일을 입력해주세요').isEmail(),
    check('password', '비밀번호는 필수입니다').exists()
  ],
  login
);

// 현재 사용자 정보 라우트
router.get('/me', protect, getCurrentUser);

// 로그아웃 라우트
router.get('/logout', protect, logout);

module.exports = router;