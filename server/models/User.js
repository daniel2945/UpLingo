const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // חובה להתקין: npm install bcryptjs

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    
    // התקדמות: איזה מספר שלב המשתמש פתח עכשיו
    currentMissionOrder: { type: Number, default: 1 },

    // ארגז החול (Sandbox): אוצר המילים שהמשתמש כבר פגש
    sandbox: [{
        word: { type: String, required: true }, // המילה בשפת היעד
        translation: { type: String },          // התרגום לעברית
        type: { type: String, enum: ['verb', 'noun', 'adjective', 'other'] },
        score: { type: Number, default: 0 },    // רמת שליטה (עולה כשהוא צודק, יורד כשטועה)
        lastReviewed: { type: Date, default: Date.now }
    }]

}, { timestamps: true });

// וודא שכתוב (next) בסוגריים כאן!
userSchema.pre('save', async function() { 
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);