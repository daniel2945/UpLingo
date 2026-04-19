const mongoose = require('mongoose');

const GrammarRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true, unique: true }, // למשל: "הטיית Ser בהווה"
  level: { type: String, required: true }, // לאיזו רמה החוק מתאים
  adminNotes: { type: String }, // הערות לעצמך: "להסביר שזה למצב קבוע בלבד"
  aiInstruction: { 
    type: String, 
    required: true 
    // זה קריטי! פה תכתוב למשל: "Explain the verb Ser. Focus on identity and professions. Do not mention the verb Estar at all."
  },
  isTaught: { 
    type: Boolean, 
    default: false 
  }
});

module.exports = mongoose.model('GrammarRule', GrammarRuleSchema);