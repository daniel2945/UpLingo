const express = require('express');
const userRouter = express.Router();
const { getMe } = require('../controllers/user');
const { verifyToken } = require('../middleware/auth');

// GET /api/users/me (Protected)
userRouter.get('/me', verifyToken, getMe);

module.exports = userRouter;