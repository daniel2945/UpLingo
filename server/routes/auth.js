const express = require('express');
const authRouter = express.Router();
// ייבוא הלוגיקה מהקונטרולר
const { register, login } = require('../controllers/auth');

// הגדרת הנתיבים
authRouter.post('/register', register);
authRouter.post('/login', login);

module.exports = authRouter;