const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결 설정
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB 연결 성공!');
  } catch (err) {
    console.error('MongoDB 연결 실패:', err.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};