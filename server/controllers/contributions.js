// server/controllers/contributions.js

const Contribution = require('../models/Contribution');
const WeeklyReport = require('../models/WeeklyReport');
const Team = require('../models/Team');
const { validationResult } = require('express-validator');

// @desc   보고서의 모든 기여도 가져오기
// @route  GET /api/reports/:reportId/contributions
// @access Private (Team Members, Admin)
exports.getContributions = async (req, res) => {
  try {
    // 보고서 존재 확인
    const report = await WeeklyReport.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '보고서를 찾을 수 없습니다'
      });
    }

    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 사용자가 팀원이거나 관리자인지 확인
    if (req.user.role !== 'admin' && !req.user.teams.includes(team._id)) {
      return res.status(403).json({
        success: false,
        error: '이 보고서의 기여도에 접근할 권한이 없습니다'
      });
    }

    const contributions = await Contribution.find({ report: req.params.reportId })
      .populate({
        path: 'user',
        select: 'name username'
      });

    res.status(200).json({
      success: true,
      count: contributions.length,
      data: contributions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   기여도 추가
// @route  POST /api/reports/:reportId/contributions
// @access Private (Team Members, Admin)
exports.addContribution = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 보고서 존재 확인
    const report = await WeeklyReport.findById(req.params.reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: '보고서를 찾을 수 없습니다'
      });
    }

    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 사용자가 팀원이거나 관리자인지 확인
    if (req.user.role !== 'admin' && !req.user.teams.includes(team._id)) {
      return res.status(403).json({
        success: false,
        error: '이 보고서에 기여도를 추가할 권한이 없습니다'
      });
    }

    // 기본적으로 현재 사용자의 기여도 추가
    const userId = req.body.user || req.user.id;

    // 관리자나 팀 리더만 다른 사용자의 기여도 추가 가능
    if (userId !== req.user.id) {
      const isTeamLeader = team.leader.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (!isTeamLeader && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: '다른 사용자의 기여도를 추가할 권한이 없습니다'
        });
      }

      // 기여도를 추가할 사용자가 팀원인지 확인
      if (!team.members.includes(userId)) {
        return res.status(400).json({
          success: false,
          error: '해당 사용자는 팀원이 아닙니다'
        });
      }
    }

    // 동일한 사용자의 기여도가 이미 있는지 확인
    const existingContribution = await Contribution.findOne({
      report: req.params.reportId,
      user: userId
    });

    if (existingContribution) {
      return res.status(400).json({
        success: false,
        error: '이미 이 보고서에 기여도를 추가했습니다'
      });
    }

    // 기여도 생성
    const contribution = await Contribution.create({
      report: req.params.reportId,
      user: userId,
      description: req.body.description,
      hours: req.body.hours
    });

    res.status(201).json({
      success: true,
      data: contribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   기여도 업데이트
// @route  PUT /api/contributions/:id
// @access Private (Contribution Owner, Team Leader, Admin)
exports.updateContribution = async (req, res) => {
  try {
    let contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: '기여도를 찾을 수 없습니다'
      });
    }

    // 보고서 정보 가져오기
    const report = await WeeklyReport.findById(contribution.report);
    
    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 기여도 소유자, 팀 리더, 관리자만 수정 가능
    const isOwner = contribution.user.toString() === req.user.id;
    const isTeamLeader = team.leader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: '기여도 수정 권한이 없습니다'
      });
    }

    // 사용자 및 보고서 변경 방지
    delete req.body.user;
    delete req.body.report;

    contribution = await Contribution.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: contribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   기여도 삭제
// @route  DELETE /api/contributions/:id
// @access Private (Contribution Owner, Team Leader, Admin)
exports.deleteContribution = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);

    if (!contribution) {
      return res.status(404).json({
        success: false,
        error: '기여도를 찾을 수 없습니다'
      });
    }

    // 보고서 정보 가져오기
    const report = await WeeklyReport.findById(contribution.report);
    
    // 팀 정보 가져오기
    const team = await Team.findById(report.team);

    // 기여도 소유자, 팀 리더, 관리자만 삭제 가능
    const isOwner = contribution.user.toString() === req.user.id;
    const isTeamLeader = team.leader.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isTeamLeader && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: '기여도 삭제 권한이 없습니다'
      });
    }

    await contribution.remove();

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