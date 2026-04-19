const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // חובה להתקין: npm install bcryptjs

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    // בתוך הסכימה של ה-User:
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // התקדמות: איזה מספר שלב המשתמש פתח עכשיו
    currentMissionOrder: { type: Number, default: 1 },

    // ארגז החול (Sandbox): אוצר המילים שהמשתמש כבר פגש
    sandbox: [
      {
        word: String,
        type: {
          type: String,
          // הוספנו את כל הסוגים מהמאגר החדש, ועוד גיבוי כללי
          enum: ["verb", "noun", "adjective", "phrase", "vocabulary"],
        },
        score: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true },
);

// וודא שכתוב (next) בסוגריים כאן!
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
