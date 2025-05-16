// server/routes/reports.js

const express = require('express');
const { check } = require('express-validator');
const {
  getReports,
  getReport,
  updateReport,
  deleteReport,
  getTeamReports,
  createReport
} = require('../controllers/reports');
const { protect, checkTeamMembership } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 전체 보고서 목록 라우트
router.route('/').get(getReports);

// 특정 보고서 조회, 수정, 삭제 라우트
router
  .route('/:id')
  .get(getReport)
  .put(
    [
      check('goals', '목표는 필수입니다').optional(),
      check('progress', '진행 상황은 필수입니다').optional(),
      check('completionRate', '완료율은 0-100 사이여야 합니다')
        .optional()
        .isFloat({ min: 0, max: 100 }),
      check('status', '상태는 유효한 값이어야 합니다')
        .optional()
        .isIn(['not_started', 'in_progress', 'completed'])
    ],
    updateReport
  )
  .delete(deleteReport);

// 팀별 보고서 관련 라우트 (teams.js에서 재사용)
router.route('/teams/:teamId/reports')
  .get(checkTeamMembership, getTeamReports)
  .post(
    [
      check('goals', '목표는 필수입니다').not().isEmpty(),
      check('progress', '진행 상황은 필수입니다').not().isEmpty()
    ],
    checkTeamMembership,
    createReport
  );

module.exports = router;