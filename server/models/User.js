// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '사용자 이름은 필수입니다'],
      unique: true,
      trim: true,
      minlength: [3, '사용자 이름은 최소 3자 이상이어야 합니다'],
      maxlength: [20, '사용자 이름은 최대 20자까지 가능합니다']
    },
    email: {
      type: String,
      required: [true, '이메일은 필수입니다'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        '유효한 이메일 주소를 입력해주세요'
      ]
    },
    password: {
      type: String,
      required: [true, '비밀번호는 필수입니다'],
      minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다'],
      select: false
    },
    name: {
      type: String,
      required: [true, '이름은 필수입니다']
    },
    role: {
      type: String,
      enum: ['admin', 'leader', 'member'],
      default: 'member'
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      }
    ]
  },
  {
    timestamps: true
  }
);

// 비밀번호 암호화 미들웨어
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT 토큰 생성 메서드
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 비밀번호 일치 확인 메서드
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);