const Mission = require('../models/Mission');
const UserProgress = require('../models/UserProgress');

// GET /:missionOrder?lang=es (או en)
const getMissionLesson = async (req, res) => {
    try {
        const order = parseInt(req.params.missionOrder);
        const { lang } = req.query; // הלקוח שולח באיזו שפה הוא נמצא עכשיו

        // מוצאים משימה שמתאימה גם למספר וגם לשפה
        const mission = await Mission.findOne({ 
            missionOrder: order, 
            language: lang, 
            isPublished: true 
        });
        
        if (!mission) {
            return res.status(404).json({ message: "Mission not found for this language." });
        }
        
        res.json(mission);
    } catch (error) {
        res.status(500).json({ error: "Server error retrieving mission" });
    }
};

// POST /complete
const completeMission = async (req, res) => {
    try {
        const { missionOrder, language } = req.body; // מקבלים שפה כדי לדעת איזה "עולם" לעדכן
        const userId = req.user._id;

        // 1. מושכים את נתוני המשימה (כולל המילים)
        const mission = await Mission.findOne({ missionOrder, language }).populate('targetVocabularyRefs');
        if (!mission) return res.status(404).json({ message: "Mission not found" });

        // 2. מוצאים (או יוצרים) את פרופיל ההתקדמות של המשתמש בשפה הזו
        let progress = await UserProgress.findOne({ userId, language });
        if (!progress) {
            progress = new UserProgress({ userId, language });
        }

        // 3. עדכון ה-Sandbox (ארגז החול) בתוך ה-UserProgress
        if (mission.targetVocabularyRefs && mission.targetVocabularyRefs.length > 0) {
            mission.targetVocabularyRefs.forEach(vocabObj => {
                // בודקים אם המילה כבר קיימת לפי ה-ID שלה
                const exists = progress.sandbox.find(s => s.vocabularyId.toString() === vocabObj._id.toString());
                if (!exists) {
                    progress.sandbox.push({
                        vocabularyId: vocabObj._id,
                        score: 1 
                    });
                }
            });
        }

        // 4. קידום המשתמש במסלול של השפה הספציפית הזו
        if (mission.missionOrder >= progress.currentMissionOrder) {
            progress.currentMissionOrder = progress.currentMissionOrder + 1;
        }

        await progress.save();
        
        res.json({ 
            success: true, 
            message: "Progress saved!", 
            currentMissionOrder: progress.currentMissionOrder,
            sandbox: progress.sandbox
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMissionLesson,
    completeMission
};