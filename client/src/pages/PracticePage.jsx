import React, { useState } from "react";
import { Languages, BookOpen, Library, Box } from "lucide-react";
import useLearningStore from "../store/learningStore";

// ייבוא הקומפוננטות החכמות שבנינו
import SandboxTab from "../components/SandboxTab";
import TranslatorTab from "../components/TranslatorTab";
import ReadingTab from "../components/ReadingTab";

const PracticePage = () => {
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
  ];
  
  const learningLang = useLearningStore((state) => state.language);
  const targetLangName = LANGUAGES.find((l) => l.code === learningLang)?.label || "English";
  
  const [activeTab, setActiveTab] = useState("sandbox");

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-32" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <Box className="text-primary" size={36} /> אזור תרגול
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          שפר את ה-{targetLangName} שלך עם כלי AI חכמים
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap justify-center bg-white border border-slate-200 p-1.5 rounded-2xl w-fit mx-auto shadow-sm gap-1">
        <button 
          onClick={() => setActiveTab("sandbox")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "sandbox" ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <Library size={20} /> האוצר שלי
        </button>
        <button 
          onClick={() => setActiveTab("translator")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "translator" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <Languages size={20} /> מתרגם AI
        </button>
        <button 
          onClick={() => setActiveTab("reading")} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "reading" ? "bg-teal-50 text-teal-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
        >
          <BookOpen size={20} /> קטעי קריאה
        </button>
      </div>

      {/* Render Active Component */}
      <div className="mt-6">
        {activeTab === "sandbox" && <SandboxTab learningLang={learningLang} />}
        {activeTab === "translator" && <TranslatorTab learningLang={learningLang} targetLangName={targetLangName} />}
        {activeTab === "reading" && <ReadingTab learningLang={learningLang} targetLangName={targetLangName} />}
      </div>
    </div>
  );
};

export default PracticePage;