// server/routes/teams.js

const express = require('express');
const { check } = require('express-validator');
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember
} = require('../controllers/teams');
const {
  getTeamReports,
  createReport
} = require('../controllers/reports');
const { protect, authorize, checkTeamMembership } = require('../middleware/auth');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(protect);

// 팀 목록 및 생성 라우트
router
  .route('/')
  .get(getTeams)
  .post(
    [
      check('name', '팀 이름은 필수입니다').not().isEmpty(),
      check('type', '팀 유형은 필수입니다').isIn(['study', 'project']),
      check('description', '팀 설명은 필수입니다').not().isEmpty()
    ],
    authorize('admin', 'leader'),
    createTeam
  );

// 특정 팀 조회, 수정, 삭제 라우트
router
  .route('/:id')
  .get(checkTeamMembership, getTeam)
  .put(checkTeamMembership, updateTeam)
  .delete(checkTeamMembership, deleteTeam);

// 팀원 추가 라우트
router.post('/:id/members', checkTeamMembership, addTeamMember);

// 팀원 제거 라우트
router.delete('/:id/members/:userId', checkTeamMembership, removeTeamMember);

// ✅ 팀별 보고서 라우트 추가
router
  .route('/:id/reports')
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