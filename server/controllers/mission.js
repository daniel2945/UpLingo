const Mission = require('../models/Mission');
const User = require('../models/User');
// אפשר למחוק את ה-import של geminiService! אנחנו נשתמש בו רק בראוטים של המנהל בעתיד.

// GET /:missionOrder
const getMissionLesson = async (req, res) => {
    try {
        const order = parseInt(req.params.missionOrder);
        const mission = await Mission.findOne({ missionOrder: order, isPublished: true });
        
        if (!mission) {
            return res.status(404).json({ message: "Mission not found or not published yet." });
        }
        
        res.json(mission);
    } catch (error) {
        res.status(500).json({ error: "Server error retrieving mission" });
    }
};

// POST / (Admin)
const createMission = async (req, res) => {
    try {
        const newMission = new Mission(req.body);
        await newMission.save();
        res.status(201).json({ success: true, data: newMission });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// POST /complete
const completeMission = async (req, res) => {
    try {
        const { missionOrder } = req.body;
        const userId = req.user._id;

        // שים לב ל-populate! אנחנו מושכים את המידע המלא על המילים החדשות של השיעור הזה
        const mission = await Mission.findOne({ missionOrder }).populate('targetVocabularyRefs');
        if (!mission) return res.status(404).json({ message: "Mission not found" });

        const user = await User.findById(userId);

        // 1. עוברים על המילים האמיתיות מהמאגר שלנו (שהן ה-Target של השיעור)
        if (mission.targetVocabularyRefs && mission.targetVocabularyRefs.length > 0) {
            mission.targetVocabularyRefs.forEach(vocabObj => {
                // בודקים אם המילה כבר קיימת בארגז החול של המשתמש
                const exists = user.sandbox.find(s => s.word === vocabObj.word);
                if (!exists) {
                    user.sandbox.push({
                        word: vocabObj.word,
                        type: vocabObj.type, // שומר את הסוג האמיתי! (noun, verb, adjective)
                        score: 1 
                    });
                }
            });
        }

        // 2. מקדמים את המשתמש במסלול (אם הוא לא חזר אחורה לתרגל)
        if (mission.missionOrder >= user.currentMissionOrder) {
            user.currentMissionOrder = user.currentMissionOrder + 1;
        }

        // עכשיו השמירה תעבור בהצלחה כי המודל עודכן
        await user.save();
        
        res.json({ 
            success: true, 
            message: "Mission completed!", 
            currentMissionOrder: user.currentMissionOrder,
            sandbox: user.sandbox
        });

    } catch (error) {
        console.error("Complete Mission Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMissionLesson,
    createMission,
    completeMission
};