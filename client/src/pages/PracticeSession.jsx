import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Check, ArrowRight, Loader2, Trophy, RotateCcw } from "lucide-react";
import API_CALL from "../api/API_CALL";

const PracticeSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // מקבלים את המילים והשפה מה-Navigate של העמוד הקודם
  const words = location.state?.words || [];
  const language = location.state?.language || "en";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]); // [{ wordId, isCorrect }]
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- States עבור הכרטיסייה הנוכחית ---
  const [questionType, setQuestionType] = useState("flashcard"); // 'flashcard' | 'quiz'
  const [isFlipped, setIsFlipped] = useState(false);
  const [options, setOptions] = useState([]);

  // אם אין מילים (למשל אם מישהו נכנס ישירות ל-URL), נזרוק אותו חזרה
  useEffect(() => {
    if (words.length === 0) {
      navigate("/practice");
    } else {
      setupQuestion(0);
    }
  }, []);

  // פונקציה שמכינה את השאלה (מגרילה אם זה פלאשקארד או אמריקאי)
  const setupQuestion = (index) => {
    setIsFlipped(false);
    const type = Math.random() > 0.5 ? "quiz" : "flashcard";
    setQuestionType(type);

    if (type === "quiz") {
      const currentWord = words[index];
      // מוצאים 3 מילים אחרות שיהיו התשובות השגויות
      const wrongOptions = words
        .filter((_, idx) => idx !== index)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      // מערבבים את הנכונה עם השגויות
      const allOptions = [...wrongOptions, currentWord].sort(() => 0.5 - Math.random());
      setOptions(allOptions);
    }
  };

  const handleAnswer = (isCorrect) => {
    const currentWord = words[currentIndex];
    // אנחנו שומרים את ה-ID הייחודי של המילה מתוך ארגז החול
    const wordId = currentWord.vocabularyId?._id || currentWord._id;

    setResults((prev) => [...prev, { wordId, isCorrect }]);

    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
      setupQuestion(currentIndex + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setIsFinished(true);
    setIsSaving(true);
    try {
      // נשתמש ב-results השלם שכולל גם את התשובה האחרונה
      const finalResults = [...results, { 
        wordId: words[currentIndex].vocabularyId?._id || words[currentIndex]._id, 
        isCorrect: arguments[0] // תופס את ה-isCorrect מהלחיצה האחרונה
      }];

      await API_CALL("/users/sandbox/update", "PUT", {
        language,
        results: finalResults,
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (words.length === 0) return null;

  const currentWordItem = words[currentIndex];
  const displayWord = currentWordItem?.vocabularyId?.word || currentWordItem?.word || "";
  const displayTrans = currentWordItem?.vocabularyId?.translation || currentWordItem?.translation || "";
  
  // חישוב אחוזי הצלחה בסוף
  const correctCount = results.filter(r => r.isCorrect).length;
  const scorePercentage = Math.round((correctCount / words.length) * 100);

  return (
    <div className="max-w-xl mx-auto pt-10 px-4 space-y-8" dir="rtl">
      
      {/* --- מסך סיום משחק --- */}
      {isFinished ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center border-t-8 border-indigo-500 animate-in zoom-in-95">
          <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={48} className="text-indigo-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">כל הכבוד!</h2>
          <p className="text-slate-500 font-medium mb-8">סיימת את האימון היומי שלך.</p>
          
          <div className="flex justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-800">{scorePercentage}%</div>
              <div className="text-sm font-bold text-slate-400 uppercase">הצלחה</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-teal-600">{correctCount}</div>
              <div className="text-sm font-bold text-slate-400 uppercase">תשובות נכונות</div>
            </div>
          </div>

          {isSaving ? (
            <p className="text-slate-400 flex items-center justify-center gap-2 font-medium">
              <Loader2 className="animate-spin" size={18} /> שומר התקדמות...
            </p>
          ) : (
            <button 
              onClick={() => navigate("/practice")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition"
            >
              <RotateCcw size={20} /> חזור לארגז החול
            </button>
          )}
        </div>
      ) : (
        /* --- מסך המשחק הרץ --- */
        <>
          {/* Progress Bar */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate("/practice")} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-500 rounded-full" 
                style={{ width: `${(currentIndex / words.length) * 100}%` }}
              />
            </div>
            <span className="font-bold text-slate-500 text-sm">{currentIndex + 1} / {words.length}</span>
          </div>

          {/* משחק אמריקאי (Quiz) */}
          {questionType === "quiz" && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <h3 className="text-center text-xl font-bold text-slate-500 mb-6">מה התרגום של המילה:</h3>
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center mb-8">
                <span className="text-4xl font-black text-slate-800" dir="ltr">{displayWord}</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => {
                  const optTrans = opt.vocabularyId?.translation || opt.translation;
                  const isActuallyCorrect = optTrans === displayTrans;
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleAnswer(isActuallyCorrect)}
                      className="bg-white hover:bg-indigo-50 hover:border-indigo-200 border-2 border-slate-100 p-5 rounded-2xl text-lg font-bold text-slate-700 transition-all text-center"
                    >
                      {optTrans}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* כרטיסיות (Flashcard) */}
          {questionType === "flashcard" && (
            <div className="animate-in slide-in-from-right-8 duration-300 flex flex-col items-center">
              <h3 className="text-center text-xl font-bold text-slate-500 mb-6">האם אתה זוכר את המילה?</h3>
              
              <div 
                onClick={() => setIsFlipped(true)}
                className={`w-full h-64 rounded-3xl shadow-sm border-2 cursor-pointer transition-all duration-300 flex items-center justify-center relative perspective-1000 ${isFlipped ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                {!isFlipped ? (
                  <div className="text-center">
                    <span className="text-5xl font-black text-slate-800" dir="ltr">{displayWord}</span>
                    <p className="text-slate-400 font-medium mt-4 text-sm uppercase tracking-widest">לחץ כדי להפוך</p>
                  </div>
                ) : (
                  <div className="text-center animate-in fade-in duration-300">
                    <span className="text-4xl font-black text-indigo-700">{displayTrans}</span>
                    <p className="text-slate-500 font-medium mt-2 text-lg" dir="ltr">{displayWord}</p>
                  </div>
                )}
              </div>

              {/* כפתורי ידעתי / לא ידעתי מופיעים רק אחרי שהופכים */}
              {isFlipped && (
                <div className="flex gap-4 w-full mt-8 animate-in slide-in-from-bottom-4">
                  <button 
                    onClick={() => handleAnswer(false)}
                    className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-bold py-4 rounded-2xl text-lg transition-colors"
                  >
                    לא זכרתי
                  </button>
                  <button 
                    onClick={() => handleAnswer(true)}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors shadow-lg"
                  >
                    זכרתי מעולה!
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PracticeSession;