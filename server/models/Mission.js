const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
    missionId: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    }, // למשל: "a1_verbs_1"
    
    level: { 
        type: String, 
        required: true,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] // מוודא שלא נכניס בטעות רמה לא קיימת
    },
    
    order: { 
        type: Number, 
        required: true 
    }, // המיקום של השלב במפה (1, 2, 3...)
    
    grammarRule: { 
        type: String, 
        required: true 
    }, // הנושא. למשל: "Present Tense - AR verbs"
    
    requiredVerbs: [{ 
        type: String 
    }], // מערך של פעלים. למשל: ["hablar", "cantar"]
    
    requiredNouns: [{ 
        type: String 
    }], // מערך של שמות עצם. למשל: ["casa", "amigo"]
    
    explanationHint: { 
        type: String 
    } // טיפ ל-AI איך להסביר את החוק (אופציונלי)
    
}, { 
    timestamps: true // מוסיף אוטומטית תאריכי יצירה ועדכון
});

module.exports = mongoose.model('Mission', missionSchema);