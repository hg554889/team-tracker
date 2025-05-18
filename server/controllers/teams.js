// server/controllers/teams.js

const Team = require('../models/Team');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc   모든 팀 가져오기
// @route  GET /api/teams
// @access Private
exports.getTeams = async (req, res) => {
  try {
    let query;

    // 관리자가 아닌 경우 자신이 속한 팀만 볼 수 있음
    if (req.user.role !== 'admin') {
      query = Team.find({ _id: { $in: req.user.teams } });
    } else {
      query = Team.find();
    }

    // 팀 리더 정보와 멤버 수 포함
    query = query.populate({
      path: 'leader',
      select: 'name username'
    });

    const teams = await query;

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   특정 팀 가져오기
// @route  GET /api/teams/:id
// @access Private
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'leader',
        select: 'name username email'
      })
      .populate({
        path: 'members',
        select: 'name username email'
      });

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
        error: '이 팀에 접근할 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   새 팀 생성
// @route  POST /api/teams
// @access Private (Leader, Admin)
exports.createTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 리더나 관리자만 팀 생성 가능
    if (req.user.role !== 'admin' && req.user.role !== 'leader') {
      return res.status(403).json({
        success: false,
        error: '팀 생성 권한이 없습니다'
      });
    }

    // 리더 ID를 현재 사용자로 설정
    req.body.leader = req.user.id;
    
    // 팀원 목록에 리더 추가
    req.body.members = [req.user.id];

    const team = await Team.create(req.body);

    // 사용자 정보에 새 팀 추가
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { teams: team._id } },
      { new: true }
    );

    console.log('팀 생성 요청 데이터:', req.body);
    console.log('생성된 팀:', team);

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   팀 정보 업데이트
// @route  PUT /api/teams/:id
// @access Private (Team Leader, Admin)
exports.updateTeam = async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 팀 리더나 관리자만 팀 정보 업데이트 가능
    if (req.user.role !== 'admin' && team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '팀 정보 업데이트 권한이 없습니다'
      });
    }

    // 리더 변경 시도 방지 (별도의 API로 처리해야 함)
    if (req.body.leader && req.body.leader !== team.leader.toString()) {
      return res.status(400).json({
        success: false,
        error: '리더는 이 API로 변경할 수 없습니다'
      });
    }

    // 멤버 변경 시도 방지 (별도의 API로 처리해야 함)
    if (req.body.members) {
      delete req.body.members;
    }

    team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   팀 삭제
// @route  DELETE /api/teams/:id
// @access Private (Team Leader, Admin)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 팀 리더나 관리자만 팀 삭제 가능
    if (req.user.role !== 'admin' && team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '팀 삭제 권한이 없습니다'
      });
    }

    // 모든 팀원의 teams 배열에서 이 팀 제거
    await User.updateMany(
      { teams: team._id },
      { $pull: { teams: team._id } }
    );

    // 팀 관련 보고서와 기여도는 pre middleware에서 삭제됨
    await team.remove();

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

// @desc   팀원 추가
// @route  POST /api/teams/:id/members
// @access Private (Team Leader, Admin)
exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID는 필수입니다'
      });
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 팀 리더나 관리자만 팀원 추가 가능
    if (req.user.role !== 'admin' && team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '팀원 추가 권한이 없습니다'
      });
    }

    // 추가할 사용자 존재 확인
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '추가할 사용자를 찾을 수 없습니다'
      });
    }

    // 이미 팀원인지 확인
    if (team.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '이미 팀원입니다'
      });
    }

    // 팀원 추가
    team.members.push(userId);
    await team.save();

    // 사용자 정보에 팀 추가
    user.teams.push(team._id);
    await user.save();

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};

// @desc   팀원 제거
// @route  DELETE /api/teams/:id/members/:userId
// @access Private (Team Leader, Admin)
exports.removeTeamMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    const userId = req.params.userId;

    if (!team) {
      return res.status(404).json({
        success: false,
        error: '팀을 찾을 수 없습니다'
      });
    }

    // 팀 리더나 관리자만 팀원 제거 가능
    if (req.user.role !== 'admin' && team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: '팀원 제거 권한이 없습니다'
      });
    }

    // 팀 리더는 제거할 수 없음
    if (team.leader.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: '팀 리더는 제거할 수 없습니다'
      });
    }

    // 팀원인지 확인
    if (!team.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: '해당 사용자는 팀원이 아닙니다'
      });
    }

    // 팀원 제거
    team.members = team.members.filter(
      member => member.toString() !== userId
    );
    await team.save();

    // 사용자 정보에서 팀 제거
    await User.findByIdAndUpdate(
      userId,
      { $pull: { teams: team._id } }
    );

    res.status(200).json({
      success: true,
      data: team
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: '서버 오류'
    });
  }
};