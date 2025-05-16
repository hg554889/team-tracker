// server/models/Team.js

const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '팀 이름은 필수입니다'],
      trim: true,
      maxlength: [50, '팀 이름은 최대 50자까지 가능합니다']
    },
    type: {
      type: String,
      required: [true, '팀 유형은 필수입니다'],
      enum: ['study', 'project'],
      default: 'project'
    },
    description: {
      type: String,
      required: [true, '팀 설명은 필수입니다'],
      maxlength: [500, '팀 설명은 최대 500자까지 가능합니다']
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '팀 리더는 필수입니다']
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 팀에 속한 주간 보고서 가상 필드
TeamSchema.virtual('weeklyReports', {
  ref: 'WeeklyReport',
  localField: '_id',
  foreignField: 'team',
  justOne: false
});

// 팀 삭제 시 관련 주간 보고서도 함께 삭제
TeamSchema.pre('remove', async function(next) {
  await this.model('WeeklyReport').deleteMany({ team: this._id });
  next();
});

module.exports = mongoose.model('Team', TeamSchema);