const express = require('express');
const adminRouter = express.Router();
const { generateMissionDraft, publishMission, getNextMissionOrder} = require('../controllers/adminMission');
const { getVocabulary, addVocabulary, getRules, addRule, deleteVocabulary, deleteRule } = require('../controllers/adminData');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// כל ראוט כאן יעבור קודם בדיקת Token, ואז בדיקת תפקיד מנהל
adminRouter.post('/missions/generate', verifyToken, verifyAdmin, generateMissionDraft);
adminRouter.post('/missions/publish', verifyToken, verifyAdmin, publishMission);
adminRouter.get('/vocabulary', verifyToken, verifyAdmin, getVocabulary);
adminRouter.post('/vocabulary', verifyToken, verifyAdmin, addVocabulary);
adminRouter.get('/rules', verifyToken, verifyAdmin, getRules);
adminRouter.post('/rules', verifyToken, verifyAdmin, addRule);
adminRouter.delete('/vocabulary/:id', verifyToken, verifyAdmin, deleteVocabulary);
adminRouter.delete('/rules/:id', verifyToken, verifyAdmin, deleteRule);
adminRouter.get('/missions/next-order', verifyToken, verifyAdmin, getNextMissionOrder);


module.exports = adminRouter;