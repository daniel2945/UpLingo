const express = require('express');
const missionRouter = express.Router();
const { getMissionLesson, createMission, completeMission } = require('../controllers/mission');
const { isVerified } = require('../middleware/auth');

// 1. שליפת וייצור שיעור (GET) - Protected because it uses user sandbox
missionRouter.get('/:id', isVerified, getMissionLesson);

// 2. הזרקת משימה חדשה לסילבוס (POST - Public/Admin)
missionRouter.post('/', createMission);

// 3. אישור סיום משימה ועדכון ארגז החול של המשתמש (POST)
missionRouter.post('/complete', isVerified, completeMission);

module.exports = missionRouter;