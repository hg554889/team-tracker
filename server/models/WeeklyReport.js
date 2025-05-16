// server/models/WeeklyReport.js

const mongoose = require('mongoose');

const WeeklyReportSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, '팀 정보는 필수입니다']
    },
    weekNumber: {
      type: Number,
      required: [true, '주차 번호는 필수입니다']
    },
    startDate: {
      type: Date,
      required: [true, '시작 날짜는 필수입니다']
    },
    endDate: {
      type: Date,
      required: [true, '종료 날짜는 필수입니다']
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    goals: {
      type: String,
      required: [true, '목표는 필수입니다'],
      maxlength: [1000, '목표는 최대 1000자까지 가능합니다']
    },
    progress: {
      type: String,
      required: [true, '진행 상황은 필수입니다'],
      maxlength: [2000, '진행 상황은 최대 2000자까지 가능합니다']
    },
    challenges: {
      type: String,
      maxlength: [1000, '도전 과제는 최대 1000자까지 가능합니다']
    },
    nextWeekPlan: {
      type: String,
      maxlength: [1000, '다음 주 계획은 최대 1000자까지 가능합니다']
    },
    completionRate: {
      type: Number,
      min: [0, '완료율은 0 이상이어야 합니다'],
      max: [100, '완료율은 100 이하이어야 합니다'],
      default: 0
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '제출자 정보는 필수입니다']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 보고서에 속한 기여도 가상 필드
WeeklyReportSchema.virtual('contributions', {
  ref: 'Contribution',
  localField: '_id',
  foreignField: 'report',
  justOne: false
});

// 보고서 삭제 시 관련 기여도도 함께 삭제
WeeklyReportSchema.pre('remove', async function(next) {
  await this.model('Contribution').deleteMany({ report: this._id });
  next();
});

module.exports = mongoose.model('WeeklyReport', WeeklyReportSchema);