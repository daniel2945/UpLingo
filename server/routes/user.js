const express = require('express');
const userRouter = express.Router();
const { getMe } = require('../controllers/user');
const { isVerified } = require('../middleware/auth');

// GET /api/users/me (Protected)
userRouter.get('/me', isVerified, getMe);

module.exports = userRouter;