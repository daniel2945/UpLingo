const express = require('express');
const missionRouter = express.Router();
const { getAllMissions, getMissionLesson, completeMission } = require('../controllers/mission');
const { verifyToken } = require('../middleware/auth');

// 1. קבלת כל המשימות (למפה ב-Dashboard)
missionRouter.get('/', verifyToken, getAllMissions);

// 2. סיום שיעור (חייב להופיע לפני ה-ID!)
missionRouter.post('/complete', verifyToken, completeMission);

// 3. טעינת שיעור ספציפי (למשל: /api/missions/64abcd1234...)
missionRouter.get('/:id', verifyToken, getMissionLesson);

module.exports = missionRouter;