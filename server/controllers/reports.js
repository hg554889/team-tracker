// server/controllers/reports.js

const WeeklyReport = require('../models/WeeklyReport');
const Team = require('../models/Team');
const { validationResult } = require('express-validator');
const { startOfWeek, endOfWeek, format } = require('date-fns');

// @desc   모든 보고서 가져오기
// @route  GET /api/reports
// @access Private
exports.getReports = async (req, res) => {
  try {
    let query;

    // 관리자가 아닌 경우 자신이 속한 팀의 보고서만 볼 수 있음
    if (req.user.role !== 'admin') {
      const teams = req.user.teams;
      query = WeeklyReport.find({ team: { $in: teams } });
    } else {
      query = WeeklyReport.find();
    }

    // 정렬 및 관계 데이터 포함
    query = query
      .sort('-createdAt')
      .populate({
        path: 'team',
        select: 'name type'
      })
      .populate({
        path: 'submittedBy',
        select: 'name username'
      });

    const reports = await query;

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   특정 팀의 보고서 가져오기
// @route  GET /api/teams/:id/reports
// @access Private (Team Members, Admin)
exports.getTeamReports = async (req, res) => {
  try {
    // teams 라우터에서는 :id, reports 라우터에서는 :teamId
    const teamId = req.params.id || req.params.teamId;
    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 사용자가 팀원이거나 관리자인지 확인
    if (req.user.role !== 'admin' && !req.user.teams.includes(team._id)) {
      return res.status(403).json({
        success: false,
        error: '이 팀의 보고서에 접근할 권한이 없습니다'
      });
    }

    const reports = await WeeklyReport.find({ team: teamId })
      .sort('-weekNumber')
      .populate({
        path: 'submittedBy',
        select: 'name username'
      });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   특정 보고서 가져오기
// @route  GET /api/reports/:id
// @access Private (Team Members, Admin)
exports.getReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id)
      .populate({
        path: 'team',
        select: 'name type description'
      })
      .populate({
        path: 'submittedBy',
        select: 'name username email'
      })
      .populate({
        path: 'contributions',
        populate: {
          path: 'user',
          select: 'name username email'
        }
      });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: '보고서를 찾을 수 없습니다'
      });
    }

    // 사용자가 팀원이거나 관리자인지 확인
    const team = await Team.findById(report.team);
    if (req.user.role !== 'admin' && !req.user.teams.includes(team._id)) {
      return res.status(403).json({
        success: false,
        error: '이 보고서에 접근할 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   새 보고서 생성
// @route  POST /api/teams/:id/reports
// @access Private (Team Members, Admin)
exports.createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // teams 라우터에서는 :id, reports 라우터에서는 :teamId
    const teamId = req.params.id || req.params.teamId;
    const team = await Team.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 사용자가 팀 리더이거나 관리자인지 확인
    if (req.user.role !== 'admin' && team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '보고서를 생성할 권한이 없습니다'
      });
    }

    // 기본 주차 정보 설정
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 일요일 종료

    // 가장 최근 보고서 찾기
    const lastReport = await WeeklyReport.findOne({ team: team._id })
      .sort('-weekNumber')
      .limit(1);

    // 새 주차 번호 설정
    const weekNumber = lastReport ? lastReport.weekNumber + 1 : 1;

    // 보고서 생성
    const report = await WeeklyReport.create({
      team: team._id,
      weekNumber,
      startDate: req.body.startDate || weekStart,
      endDate: req.body.endDate || weekEnd,
      status: req.body.status || 'not_started',
      goals: req.body.goals,
      progress: req.body.progress,
      challenges: req.body.challenges || '',
      nextWeekPlan: req.body.nextWeekPlan || '',
      completionRate: req.body.completionRate || 0,
      submittedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   보고서 업데이트
// @route  PUT /api/reports/:id
// @access Private (Report Owner, Team Leader, Admin)
exports.updateReport = async (req, res) => {
  try {
    let report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: '보고서를 찾을 수 없습니다'
      });
    }

    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 보고서 작성자, 팀 리더나 관리자만 수정 가능
    const isOwner = report.submittedBy.toString() === req.user.id;
    const isTeamLeader = team.leader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: '보고서 수정 권한이 없습니다'
      });
    }

    // 제출자 및 팀 정보 변경 방지
    delete req.body.submittedBy;
    delete req.body.team;

    // 주차 번호 변경 방지
    delete req.body.weekNumber;

    report = await WeeklyReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   보고서 삭제
// @route  DELETE /api/reports/:id
// @access Private (Team Leader, Admin)
exports.deleteReport = async (req, res) => {
  try {
    const report = await WeeklyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: '보고서를 찾을 수 없습니다'
      });
    }

    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 팀 리더나 관리자만 삭제 가능
    const isTeamLeader = team.leader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: '보고서 삭제 권한이 없습니다'
      });
    }

    // 관련 기여도도 함께 삭제됨 (pre middleware에서 처리)
    await report.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};