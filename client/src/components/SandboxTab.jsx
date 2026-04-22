import React, { useState, useEffect } from "react";
import { Loader2, Dumbbell, GraduationCap } from "lucide-react";
import API_CALL from "../api/API_CALL";
import { useNavigate } from "react-router-dom"; // להוסיף למעלה

const SandboxTab = ({ learningLang }) => {
  const [sandboxWords, setSandboxWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

const startPractice = () => {
    // בוחרים את 10 המילים עם הניקוד הכי נמוך, שאותן צריך לתרגל
    const wordsToPractice = [...sandboxWords]
        .sort((a, b) => a.score - b.score)
        .slice(0, 10);

    // מעבירים את המשתמש לדף המשחק החדש, ושולחים איתו את המילים
    navigate('/practice-session', { state: { words: wordsToPractice, language: learningLang } });
};

  useEffect(() => {
    fetchSandbox();
  }, [learningLang]);

  const fetchSandbox = async () => {
    setIsLoading(true);
    try {
      const res = await API_CALL(`/users/progress?lang=${learningLang}`);
      
      const rawSandbox = res.progress?.sandbox || [];
      const sortedWords = [...rawSandbox].sort((a, b) => new Date(b.lastPracticed) - new Date(a.lastPracticed));
      
      setSandboxWords(sortedWords);
    } catch (error) {
      console.error("Error fetching sandbox:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black mb-2">מוכן לתרגול?</h2>
          <p className="text-indigo-100 font-medium text-lg">יש לך {sandboxWords.length} מילים בארגז החול.</p>
        </div>
        <button 
  onClick={startPractice}
  disabled={sandboxWords.length < 4} // צריך לפחות 4 מילים למשחק
  className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
>
  <Dumbbell size={24} /> תרגול מהיר
</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <GraduationCap className="text-slate-400" /> רשימת המילים שלי
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
        ) : sandboxWords.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-medium text-lg">עדיין לא הוספת מילים לארגז החול.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sandboxWords.map((item, idx) => {
              const displayWord = item.vocabularyId?.word || item.word || "Unknown";
              const displayTrans = item.vocabularyId?.translation || item.translation || "";
              return (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="text-2xl font-black text-slate-800 mb-1" dir="ltr">{displayWord}</div>
                    <div className="text-lg text-slate-500 font-medium">{displayTrans}</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Score</span>
                    <div className="bg-indigo-100 text-indigo-700 font-black px-3 py-1 rounded-lg text-sm">{item.score || 0}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SandboxTab;