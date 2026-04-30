// server/scripts/seedRules.js
const path = require('path');
// טעינת משתני הסביבה (מכוון לתיקייה אחת אחורה)
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const file_name = "basic_rules_50";

const mongoose = require('mongoose');
const fs = require('fs');

// טעינת מודל חוקי הדקדוק (תיקייה אחת אחורה ואז ל-models)
const GrammarRule = require('../models/GrammarRule'); 

const seedRules = async () => {
  try {
    console.log("Connecting to MongoDB...");
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is undefined. Check if .env file is properly linked.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully!");

    // ניתוב מדויק לתיקיית קבצי ה-JSON שלך
    const filePath = path.join(__dirname, `../json files/${file_name}.json`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`\n❌ Error: Cannot find the JSON file at: ${filePath}`);
        console.error(`Make sure the folder is named 'json files' and '${file_name}.json' is inside it.`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(filePath);
    const rules = JSON.parse(rawData);

    console.log(`\nFound ${rules.length} grammar rules in ${file_name}.json.`);
    console.log("Starting seeding process...\n");

    let added = 0;
    let skipped = 0;

    for (const item of rules) {
      // בדיקה למניעת כפילויות לפי שם החוק והשפה
      const existingRule = await GrammarRule.findOne({ 
        ruleName: item.ruleName, 
        language: item.language 
      });

      if (!existingRule) {
        await GrammarRule.create(item);
        added++;
        process.stdout.write('+');
      } else {
        skipped++;
        process.stdout.write('.');
      }
    }

    console.log(`\n\n🎉 Rules Seeding Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Added new rules: ${added}`);
    console.log(`   - Skipped (already exist): ${skipped}`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error during rules seeding:", error);
    process.exit(1);
  }
};

seedRules();