// server/models/Contribution.js

const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeeklyReport',
      required: [true, '보고서 정보는 필수입니다']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 정보는 필수입니다']
    },
    description: {
      type: String,
      required: [true, '설명은 필수입니다'],
      maxlength: [500, '설명은 최대 500자까지 가능합니다']
    },
    hours: {
      type: Number,
      required: [true, '시간은 필수입니다'],
      min: [0, '시간은 0 이상이어야 합니다']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Contribution', ContributionSchema);