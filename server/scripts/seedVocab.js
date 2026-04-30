// server/scripts/seedVocab.js
const path = require('path');
// טעינת משתני הסביבה - אנו מכוונים אותו לקובץ ה-.env שנמצא תיקייה אחת אחורה
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const file_name = "basic_words_200"

const mongoose = require('mongoose');
const fs = require('fs');

// טעינת המודל מתוך תיקיית המודלים (תיקייה אחת אחורה ואז ל-models)
const Vocabulary = require('../models/Vocabulary'); 

const seedWords = async () => {
  try {
    // 1. חיבור למסד הנתונים
    console.log("Connecting to MongoDB...");
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is undefined. Check if .env file is properly linked.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully!");

    // 2. קריאת קובץ ה-JSON - מכוונים לתיקיית "json files"
    // שים לב לשם התיקייה: השתמשתי ב-"json files" כמו שכתבת, אם יש שם רווח.
    const filePath = path.join(__dirname, `../json files/${file_name}.json`);
    
    // נוודא שהקובץ קיים לפני שמנסים לקרוא
    if (!fs.existsSync(filePath)) {
        console.error(`\n❌ Error: Cannot find the JSON file at: ${filePath}`);
        console.error("Make sure the folder is exactly named 'json files' and the file 'basic_words.json' is inside it.");
        process.exit(1);
    }

    const rawData = fs.readFileSync(filePath);
    const words = JSON.parse(rawData);

    console.log(`\nFound ${words.length} words in basic_words.json.`);
    console.log("Starting seeding process...\n");

    let added = 0;
    let skipped = 0;

    // 3. ריצה על כל המילים והוספה למסד הנתונים
    for (const item of words) {
      const existingWord = await Vocabulary.findOne({ 
        word: item.word, 
        language: item.language 
      });

      if (!existingWord) {
        // המילה לא קיימת - נוסיף אותה
        await Vocabulary.create(item);
        added++;
        process.stdout.write('+'); // מדפיס פלוס
      } else {
        // המילה קיימת - נדלג
        skipped++;
        process.stdout.write('.'); // מדפיס נקודה
      }
    }

    console.log(`\n\n🎉 Seeding Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Added new words: ${added}`);
    console.log(`   - Skipped (already exist): ${skipped}`);

    // ניתוק ממסד הנתונים ויציאה
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    process.exit(1);
  }
};

// הפעלת הפונקציה
seedWords();