// server/routes/contributions.js

const express = require('express');
const { check } = require('express-validator');
const {
  getContributions,
  addContribution,
  updateContribution,
  deleteContribution
} = require('../controllers/contributions');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 보고서별 기여도 목록 및 추가 라우트
router
  .route('/reports/:reportId/contributions')
  .get(getContributions)
  .post(
    [
      check('description', '설명은 필수입니다').not().isEmpty(),
      check('hours', '시간은 0보다 커야 합니다').isFloat({ min: 0.1 })
    ],
    addContribution
  );

// 특정 기여도 수정 및 삭제 라우트
router
  .route('/:id')
  .put(
    [
      check('description', '설명은 필수입니다').optional(),
      check('hours', '시간은 0보다 커야 합니다').optional().isFloat({ min: 0.1 })
    ],
    updateContribution
  )
  .delete(deleteContribution);

module.exports = router;