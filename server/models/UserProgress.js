const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  language: { 
    type: String, 
    enum: ['en', 'es'], // מוכן מראש לספרדית ואנגלית
    required: true 
  },
  currentMissionOrder: { 
    type: Number, 
    default: 1 
  },
  // בתוך מודל UserProgress.js
sandbox: [{
    vocabularyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vocabulary' 
    }, // נשאר אופציונלי (למילים מהמילון הכללי)
    word: String,         // למילים פרטיות שהמשתמש הוסיף לבד
    translation: String,  // התרגום הפרטי שלו
    score: { type: Number, default: 0 },
    lastPracticed: { type: Date, default: Date.now }
}]
}, { timestamps: true });

// השומר בכניסה שמונע כפילויות של אותה שפה לאותו משתמש
UserProgressSchema.index({ userId: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", UserProgressSchema);