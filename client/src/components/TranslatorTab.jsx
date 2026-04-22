import React, { useState } from "react";
import { Loader2, Sparkles, Plus, ArrowRightLeft } from "lucide-react";
import API_CALL from "../api/API_CALL";

const TranslatorTab = ({ learningLang, targetLangName }) => {
  const [transInput, setTransInput] = useState("");
  const [transResult, setTransResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isToHebrew, setIsToHebrew] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const handleTranslate = async () => {
    if (!transInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await API_CALL("/tools/translate", "POST", { text: transInput, targetLang: targetLangName, isToHebrew });
      setTransResult(res.translation);
    } catch (error) { 
      alert("שגיאה בתרגום"); 
    } finally { 
      setIsTranslating(false); 
    }
  };

  const addToSandbox = async () => {
    setIsAdding(true);
    try {
      await API_CALL("/users/sandbox/add", "POST", {
        word: isToHebrew ? transInput : transResult,
        translation: isToHebrew ? transResult : transInput,
        language: learningLang
      });
      alert("המילה נוספה בהצלחה!");
    } catch (error) { 
      alert("שגיאה בשמירה"); 
    } finally { 
      setIsAdding(false); 
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800">מתרגם AI</h2>
        <button onClick={() => setIsToHebrew(!isToHebrew)} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold transition">
          {isToHebrew ? `${targetLangName} לעברית` : `עברית ל-${targetLangName}`} <ArrowRightLeft size={16} />
        </button>
      </div>
      <textarea value={transInput} onChange={(e) => setTransInput(e.target.value)} placeholder="הקלד טקסט לתרגום..." className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none resize-none text-lg" dir="auto" />
      <button onClick={handleTranslate} disabled={isTranslating || !transInput} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50">
        {isTranslating ? <Loader2 className="animate-spin" /> : <Sparkles />} תרגם
      </button>
      {transResult && (
        <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl relative">
          <p className="text-xl font-medium text-slate-800" dir="auto">{transResult}</p>
          {transInput.split(" ").length <= 3 && (
            <button onClick={addToSandbox} disabled={isAdding} className="mt-4 flex items-center gap-2 text-sm font-bold bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-300 transition">
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} הוסף לארגז החול
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TranslatorTab;