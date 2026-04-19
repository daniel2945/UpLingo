const express = require('express');
const missionRouter = express.Router();
const { getMissionLesson, completeMission } = require('../controllers/mission');
const { verifyToken } = require('../middleware/auth'); // נניח שיש לך מידלוור כזה

// טעינת שיעור ספציפי (למשל: /api/missions/1)
missionRouter.get('/:missionOrder', verifyToken, getMissionLesson);

// סיום שיעור וקבלת מילים לארגז החול
missionRouter.post('/complete', verifyToken, completeMission);

module.exports = missionRouter;