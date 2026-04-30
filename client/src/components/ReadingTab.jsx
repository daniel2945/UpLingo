import React, { useState } from "react";
import { Loader2, Sparkles, Plus, X } from "lucide-react";
import API_CALL from "../api/API_CALL";
import toast from "react-hot-toast";

const ReadingTab = ({ learningLang, targetLangName }) => {
  const [storyTopic, setStoryTopic] = useState("");
  const [storyLevel, setStoryLevel] = useState("A2");
  const [storyLength, setStoryLength] = useState("120 words");
  const [storyText, setStoryText] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    word: "",
    translation: "",
    isLoading: false,
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleGenerateStory = async () => {
    if (!storyTopic.trim()) return;
    setIsGeneratingStory(true);
    setStoryText("");
    try {
      const res = await API_CALL("/tools/generate-story", "POST", {
        topic: storyTopic,
        level: storyLevel,
        length: storyLength,
        targetLangName,
      });
      setStoryText(res.story);
    } catch (error) {
      toast.error("שגיאה ביצירת הסיפור");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleWordClick = async (rawWord) => {
    const cleanWord = rawWord.replace(/[.,!?()"{}[\]]/g, "").trim();
    if (!cleanWord) return;

    setPopup({
      show: true,
      word: cleanWord,
      translation: "מתרגם...",
      isLoading: true,
    });
    try {
      const res = await API_CALL("/tools/translate", "POST", {
        text: cleanWord,
        targetLang: targetLangName,
        isToHebrew: true,
      });
      setPopup((prev) => ({
        ...prev,
        translation: res.translation,
        isLoading: false,
      }));
    } catch (error) {
      setPopup((prev) => ({ ...prev, translation: "שגיאה", isLoading: false }));
    }
  };

  const addToSandbox = async () => {
    setIsAdding(true);
    try {
      await API_CALL("/users/sandbox/add", "POST", {
        word: popup.word,
        translation: popup.translation,
        language: learningLang,
      });
      setPopup({ show: false, word: "", translation: "", isLoading: false });
      toast.success("המילה נוספה בהצלחה!");
    } catch (error) {
      toast.error("שגיאה בשמירה");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <h2 className="text-2xl font-black text-slate-800 mb-2">
        מחולל קטעי קריאה
      </h2>
      <p className="text-slate-500 mb-6">
        לחץ על כל מילה בסיפור כדי לתרגם ולהוסיף אותה למאגר שלך.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 md:col-span-3">
          <label className="block text-sm font-bold text-slate-600 mb-2">
            על מה תרצה לקרוא?
          </label>
          <input
            type="text"
            value={storyTopic}
            onChange={(e) => setStoryTopic(e.target.value)}
            placeholder="למשל: טיול למדריד..."
            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">
            רמה (CEFR)
          </label>
          <select
            value={storyLevel}
            onChange={(e) => setStoryLevel(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none"
          >
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">
            אורך הסיפור
          </label>
          <select
            value={storyLength}
            onChange={(e) => setStoryLength(e.target.value)}
            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none"
          >
            <option value="50 words">קצר</option>
            <option value="120 words">בינוני</option>
            <option value="250 words">ארוך</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateStory}
        disabled={isGeneratingStory || !storyTopic}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2 disabled:opacity-50"
      >
        {isGeneratingStory ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Sparkles />
        )}{" "}
        צור קטע קריאה
      </button>

      {storyText && (
        <div
          className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xl leading-relaxed font-medium text-slate-800"
          dir="ltr"
        >
          {storyText.split(/\s+/).map((word, index) => (
            <span
              key={index}
              onClick={() => handleWordClick(word)}
              className="cursor-pointer hover:bg-teal-100 hover:text-teal-700 rounded px-0.5 transition-colors inline-block"
            >
              {word}{" "}
            </span>
          ))}
        </div>
      )}

      {/* Popup */}
      {popup.show && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/10"
            onClick={() =>
              setPopup({
                show: false,
                word: "",
                translation: "",
                isLoading: false,
              })
            }
          ></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-2xl z-50 w-72 text-center animate-in zoom-in-95">
            <button
              onClick={() =>
                setPopup({
                  show: false,
                  word: "",
                  translation: "",
                  isLoading: false,
                })
              }
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            <h3
              className="text-2xl font-black text-slate-800 mb-1 mt-2"
              dir="ltr"
            >
              {popup.word}
            </h3>
            {popup.isLoading ? (
              <p className="text-slate-500 my-4 flex justify-center">
                <Loader2 size={16} className="animate-spin mr-2" /> מתרגם...
              </p>
            ) : (
              <p className="text-lg font-medium text-blue-600 mb-6">
                {popup.translation}
              </p>
            )}
            <button
              onClick={addToSandbox}
              disabled={popup.isLoading || isAdding}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {isAdding ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}{" "}
              הוסף לארגז החול
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReadingTab;
