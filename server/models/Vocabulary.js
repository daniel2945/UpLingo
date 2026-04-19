const mongoose = require('mongoose');

const VocabularySchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true }, // למשל: "Ser", "Coche"
  translation: { type: String, required: true }, // למשל: "להיות", "מכונית"
  type: { 
    type: String, 
    enum: ['verb', 'noun', 'adjective', 'phrase'], // כאן אתה מפריד בין פעלים לתארים!
    required: true 
  },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true 
  },
  isTaught: { 
    type: Boolean, 
    default: false // מילה חדשה מתחילה כ-false. כשתשבץ אותה בשיעור, זה יהפוך ל-true
  },
  // שדה מיוחד לפעלים (אופציונלי)
  conjugationNotes: { type: String }
   // למשל: "פועל יוצא דופן, משתנה ל-soy"
},   { timestamps: true },
);

module.exports = mongoose.model('Vocabulary', VocabularySchema);