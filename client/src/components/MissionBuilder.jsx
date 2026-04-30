
import React, { useState, useEffect } from "react";
import {
  Wand2,
  Loader2,
  Save,
  Check,
  BookOpen,
  Sparkles,
  Globe,
  Filter,
  Edit2,
  Trash2,
  PlusCircle,
  MessageSquare
} from "lucide-react";
import API_CALL from "../api/API_CALL";
import toast from "react-hot-toast";

// --- תת קומפוננטה לעריכה/הוספה של כרטיסיה עם פרומפט אישי ---
const CardEditor = ({ initialData, onSave, onCancel, grammarRuleId, targetVocabIds }) => {
  const [card, setCard] = useState(initialData || { type: "flashcard", word: "", translation: "" });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const getOptionsStr = () => Array.isArray(card.options) ? card.options.join(", ") : card.options || "";
  const getAnswerStr = () => Array.isArray(card.correctAnswer) ? card.correctAnswer.join(", ") : card.correctAnswer || "";

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    try {
      const res = await API_CALL("/admin/missions/generate-single", "POST", {
        grammarRuleId,
        targetVocabIds,
        cardType: card.type,
        userPrompt: userPrompt
      });
      setCard(res.card);
      setUserPrompt("");
    } catch (err) {
      toast.error("AI Generation failed. Check server logs.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    let finalCard = { ...card };
    if (finalCard.type === "multiple_choice" || finalCard.type === "build_sentence") {
      if (typeof finalCard.options === "string") {
        finalCard.options = finalCard.options.split(",").map(s => s.trim()).filter(Boolean);
      }
    }
    if (finalCard.type === "build_sentence") {
      if (typeof finalCard.correctAnswer === "string") {
        finalCard.correctAnswer = finalCard.correctAnswer.split(",").map(s => s.trim()).filter(Boolean);
      }
    }
    onSave(finalCard);
  };

  return (
    <div className="border-4 border-purple-100 bg-purple-50/30 p-6 rounded-3xl space-y-6 shadow-xl w-full animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h4 className="font-black text-purple-800 flex items-center gap-2 text-lg">
          {initialData ? <Edit2 size={20} /> : <PlusCircle size={20} />} 
          {initialData ? "Edit Card Content" : "Create New Card"}
        </h4>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-purple-400 uppercase">Card Type:</span>
          <select 
            value={card.type} 
            onChange={e => setCard({ ...card, type: e.target.value })}
            className="p-2 border-2 border-purple-200 rounded-xl font-bold text-purple-800 bg-white outline-none"
          >
            <option value="concept">Concept (Explanation)</option>
            <option value="flashcard">Flashcard (New Word)</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="build_sentence">Build Sentence</option>
          </select>
        </div>
      </div>

      <div className="bg-white/60 p-4 rounded-2xl border-2 border-purple-200 space-y-3">
        <label className="flex items-center gap-2 text-sm font-black text-purple-600 uppercase tracking-wider">
          <MessageSquare size={16} /> AI Single Card Prompt (Optional)
        </label>
        <div className="flex flex-col md:flex-row gap-2">
          <input 
            type="text"
            placeholder="E.g.: 'Make a hard question about dogs' or 'Use the word Apple'..."
            value={userPrompt}
            onChange={e => setUserPrompt(e.target.value)}
            className="flex-1 p-3 rounded-xl border-2 border-purple-100 focus:border-purple-400 outline-none bg-white font-medium"
          />
          <button 
            onClick={handleAiGenerate} 
            disabled={isAiLoading || !grammarRuleId}
            className="shrink-0 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-black transition-all shadow-md disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />} 
            Generate Card
          </button>
        </div>
      </div>

      <hr className="border-purple-100" />

      <div className="space-y-4" dir="auto">
        {card.type === "concept" && (
          <div className="space-y-3">
             <input placeholder="Title" value={card.title || ""} onChange={e => setCard({...card, title: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none font-bold bg-white" />
             <textarea placeholder="Explanation..." value={card.text || ""} onChange={e => setCard({...card, text: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none bg-white h-40 resize-none leading-relaxed" />
          </div>
        )}
        {card.type === "flashcard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Word</span>
              <input placeholder="English/Target Word" value={card.word || ""} onChange={e => setCard({...card, word: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none font-black bg-white" dir="ltr" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase">Translation</span>
              <input placeholder="Hebrew Translation" value={card.translation || ""} onChange={e => setCard({...card, translation: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none font-bold bg-white" />
            </div>
          </div>
        )}
        {card.type === "multiple_choice" && (
          <div className="space-y-4">
            <input placeholder="The Question" value={card.question || ""} onChange={e => setCard({...card, question: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none font-bold bg-white" />
            <input placeholder="Options (split by comma: Yes, No, Maybe)" value={getOptionsStr()} onChange={e => setCard({...card, options: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none bg-white" dir="ltr" />
            <input placeholder="Correct Answer" value={card.correctAnswer || ""} onChange={e => setCard({...card, correctAnswer: e.target.value})} className="w-full p-4 rounded-xl border-2 border-green-200 focus:border-green-400 outline-none bg-green-50 font-black text-green-700" dir="ltr" />
          </div>
        )}
        {card.type === "build_sentence" && (
          <div className="space-y-4">
            <input placeholder="Question (e.g. Translate 'I eat an apple')" value={card.question || ""} onChange={e => setCard({...card, question: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none font-bold bg-white" />
            <input placeholder="Word Bank (split by comma)" value={getOptionsStr()} onChange={e => setCard({...card, options: e.target.value})} className="w-full p-4 rounded-xl border-2 border-white focus:border-purple-300 outline-none bg-white" dir="ltr" />
            <input placeholder="Correct Word Sequence (split by comma)" value={getAnswerStr()} onChange={e => setCard({...card, correctAnswer: e.target.value})} className="w-full p-4 rounded-xl border-2 border-green-200 focus:border-green-400 outline-none bg-green-50 font-black text-green-700" dir="ltr" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-purple-100">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors uppercase text-sm tracking-widest">Discard</button>
        <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"><Save size={18}/> Save Card</button>
      </div>
    </div>
  );
};


const MissionBuilder = ({ globalLang, setGlobalLang }) => {
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
  ];

  const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
  const [selectedLevel, setSelectedLevel] = useState("All");

  const [vocabList, setVocabList] = useState([]);
  const [rulesList, setRulesList] = useState([]);

  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [selectedTargetVocab, setSelectedTargetVocab] = useState([]);
  const [selectedReviewVocab, setSelectedReviewVocab] = useState([]);
  
  const [draftCards, setDraftCards] = useState(null);
  
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [addingCardAtIndex, setAddingCardAtIndex] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const [missionTitle, setMissionTitle] = useState("");
  const [missionOrder, setMissionOrder] = useState(1);
  const [lessonPrompt, setLessonPrompt] = useState("");

  const [cardCounts, setCardCounts] = useState({
    concept: 2,
    flashcard: 3,
    multiple_choice: 3,
    build_sentence: 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vocabData, rulesData, orderData] = await Promise.all([
          API_CALL(`/admin/vocabulary?lang=${globalLang}`),
          API_CALL(`/admin/rules?lang=${globalLang}`),
          API_CALL(`/admin/missions/next-order?lang=${globalLang}`).catch(() => ({ nextOrder: 1 }))
        ]);

        setVocabList(vocabData);
        setRulesList(rulesData);
        if (orderData?.nextOrder) setMissionOrder(orderData.nextOrder);

        setSelectedRuleId("");
        setSelectedTargetVocab([]);
        setSelectedReviewVocab([]);
        setDraftCards(null);
        setEditingCardIndex(null);
        setAddingCardAtIndex(null);
        setLessonPrompt("");
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };
    fetchData();
  }, [globalLang]);

  const toggleVocabSelection = (id, listType) => {
    if (listType === "target") {
      setSelectedTargetVocab((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
    } else {
      setSelectedReviewVocab((prev) =>
        prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      );
    }
  };

  const filteredRules = rulesList
    .filter((r) => selectedLevel === "All" || r.level === selectedLevel)
    .sort((a, b) => a._id.localeCompare(b._id));

  const filteredVocab = vocabList
    .filter((v) => selectedLevel === "All" || v.level === selectedLevel)
    .sort((a, b) => a._id.localeCompare(b._id));

  const handleGenerateTitle = async () => {
    if (!selectedRuleId) return toast.error("Select a rule first.");
    setIsGeneratingTitle(true);
    try {
      const response = await API_CALL("/admin/missions/generate-title", "POST", {
        grammarRuleId: selectedRuleId,
        targetVocabIds: selectedTargetVocab,
      });
      setMissionTitle(response.title);
    } catch (err) {
      toast.error("Error generating title.");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedRuleId) return toast.error("Please select a topic/rule!");
    
    const totalCards = cardCounts.concept + cardCounts.flashcard + cardCounts.multiple_choice + cardCounts.build_sentence;
    if (totalCards === 0) return toast.error("Please select at least one card to generate!");

    setIsGenerating(true);
    try {
      const response = await API_CALL("/admin/missions/generate", "POST", {
        grammarRuleId: selectedRuleId,
        targetVocabIds: selectedTargetVocab,
        reviewVocabIds: selectedReviewVocab,
        cardCounts,
        lessonPrompt
      });
      setDraftCards(response.draftCards);
      setEditingCardIndex(null);
      setAddingCardAtIndex(null);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 300);
    } catch (err) {
      toast.error("Error generating lesson draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishMission = async () => {
    if (!missionTitle || !draftCards || draftCards.length === 0) return toast.error("Fill title and cards.");
    if (editingCardIndex !== null || addingCardAtIndex !== null) return toast.error("יש לך כרטיסיה פתוחה לעריכה. שמור או בטל לפני הפרסום.");
    try {
      await API_CALL("/admin/missions/publish", "POST", {
        missionOrder, title: missionTitle, language: globalLang, grammarRuleId: selectedRuleId,
        targetVocabIds: selectedTargetVocab, reviewVocabIds: selectedReviewVocab,
        finalCards: draftCards, isPublished: true,
      });
      toast.success(`🎉 Published: ${missionTitle}`);
      const [updatedVocab, updatedRules] = await Promise.all([
        API_CALL(`/admin/vocabulary?lang=${globalLang}`),
        API_CALL(`/admin/rules?lang=${globalLang}`),
      ]);
      setVocabList(updatedVocab); setRulesList(updatedRules); setMissionOrder(prev => prev + 1);
      setDraftCards(null); setMissionTitle(""); setSelectedTargetVocab([]); setSelectedReviewVocab([]);
      setLessonPrompt("");
    } catch (err) {
      toast.error("Publish failed.");
    }
  };

  const saveEditedCard = (idx, updatedCard) => {
    const newCards = [...draftCards];
    newCards[idx] = updatedCard;
    setDraftCards(newCards);
    setEditingCardIndex(null);
  };

  const deleteCard = (idx) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <p className="font-bold text-slate-800">Delete this card?</p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              setDraftCards(draftCards.filter((_, i) => i !== idx));
              toast.success("Card deleted");
            }} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors w-full"
          >
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors w-full">
            Cancel
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const saveNewCard = (insertAfterIdx, newCard) => {
    const newCards = [...draftCards];
    newCards.splice(insertAfterIdx + 1, 0, newCard);
    setDraftCards(newCards);
    setAddingCardAtIndex(null);
  };

  return (
    <div className="w-full mx-auto space-y-12 animate-in fade-in duration-500 pb-24 overflow-x-hidden">
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setGlobalLang(lang.code)}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                globalLang === lang.code ? "bg-white shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Globe size={18} /> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-slate-200 pb-6 text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="text-primary" size={36} /> Mission Builder
        </h1>
      </div>

      <div className="bg-slate-100 p-2 rounded-2xl flex flex-wrap gap-2 items-center justify-center mx-auto max-w-3xl">
        <div className="text-slate-500 font-bold flex items-center gap-2 mr-4">
          <Filter size={18} /> Filter Level:
        </div>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={`px-5 py-2 rounded-xl font-bold transition-all ${
              selectedLevel === lvl ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">1</span>
            <span>Core Topic / Grammar Rule</span>
          </label>
          <select value={selectedRuleId} onChange={(e) => setSelectedRuleId(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none font-medium text-lg">
            <option value="">-- Choose Topic/Rule --</option>
            {filteredRules.map((r) => <option key={r._id} value={r._id}>{r.isTaught ? "✅ " : ""}{r.ruleName} ({r.level})</option>)}
          </select>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex flex-col space-y-2 font-black text-slate-800 mb-6 text-xl">
            <div className="flex items-center space-x-4">
              <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center shrink-0">2</span>
              <span>New Words to Teach <span className="text-slate-400 text-sm font-medium ml-2">(Optional)</span></span>
            </div>
          </label>
          <div className="flex flex-wrap gap-4">
            {filteredVocab.map((v) => (
              <button key={v._id} onClick={() => toggleVocabSelection(v._id, "target")} className={`p-4 md:px-5 md:py-4 rounded-2xl text-lg font-bold border-2 flex items-start sm:items-center gap-3 transition-all h-auto w-full lg:w-max max-w-full ${selectedTargetVocab.includes(v._id) ? "bg-primary/10 border-primary text-primary shadow-sm" : v.isTaught ? "bg-green-50 border-green-200 text-green-700 opacity-80" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm"}`} dir="ltr">
                {(selectedTargetVocab.includes(v._id) || v.isTaught) && (
                  <div className="shrink-0 mt-0.5 sm:mt-0">
                    <Check size={20} className={selectedTargetVocab.includes(v._id) ? "text-primary" : "text-green-500"} />
                  </div>
                )}
                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-1 xl:gap-2 text-left min-w-0 flex-1">
                  <span className="text-left whitespace-normal break-words leading-snug"><bdi>{v.word}</bdi></span>
                  <span className="text-sm opacity-60 text-left whitespace-normal break-words leading-snug">(<bdi>{v.translation}</bdi>)</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">3</span>
            <span>Card Distribution (Total: {cardCounts.concept + cardCounts.flashcard + cardCounts.multiple_choice + cardCounts.build_sentence})</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(cardCounts).map(([type, count]) => (
              <div key={type} className="flex flex-col">
                <label className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{type.replace("_", " ")}</label>
                <input type="number" min="0" value={count} onChange={(e) => setCardCounts({...cardCounts, [type]: parseInt(e.target.value) || 0})} className="p-3 text-xl font-bold border-2 border-slate-200 rounded-xl outline-none text-center bg-slate-50 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-pink-100 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0">4</span>
            <span>AI General Lesson Prompt <span className="text-slate-400 text-sm font-medium ml-2">(Optional)</span></span>
          </label>
          <input
            type="text"
            placeholder="E.g.: 'Make all sentences about traveling' or 'Use a funny tone'..."
            value={lessonPrompt}
            onChange={e => setLessonPrompt(e.target.value)}
            className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-pink-400 outline-none font-medium bg-slate-50 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-center py-8">
        <button onClick={handleGenerateDraft} disabled={isGenerating} className="bg-slate-900 text-white px-14 py-6 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-4">
          {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <Wand2 size={32} />}
          <span>{isGenerating ? "AI is crafting..." : "Generate AI Lesson"}</span>
        </button>
      </div>

      {draftCards && (
        <div className="bg-white rounded-[2rem] shadow-xl border-2 border-primary/20 mt-12 p-8 md:p-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-end w-full">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-tighter">Mission Order</label>
              <input type="number" value={missionOrder} onChange={(e) => setMissionOrder(parseInt(e.target.value) || 1)} className="w-full p-4 text-2xl font-black border-2 border-slate-200 rounded-2xl text-center" />
            </div>
            
            <div className="lg:col-span-7">
              <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-tighter">Lesson Title</label>
              <div className="flex items-stretch gap-2 w-full">
                <input type="text" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} placeholder="Enter title..." className="flex-1 min-w-0 w-full p-4 text-2xl font-black border-2 border-slate-200 rounded-2xl outline-none focus:border-primary transition-colors" dir="auto" />
                {/* כפתור יצירת כותרת מובנה וחזק */}
                <button onClick={handleGenerateTitle} disabled={isGeneratingTitle || !draftCards} className="shrink-0 aspect-square w-[72px] bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 rounded-2xl transition-colors flex items-center justify-center disabled:opacity-50" title="Generate AI Title">
                  {isGeneratingTitle ? <Loader2 className="animate-spin" size={28} /> : <Wand2 size={28} />}
                </button>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <button onClick={handlePublishMission} className="w-full h-[72px] bg-green-500 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-green-600 shadow-lg transition-all">
                <Save size={28} /> <span>Publish Now</span>
              </button>
            </div>
          </div>

          <h3 className="font-black text-2xl text-slate-800 mb-8 flex items-center gap-3"><BookOpen className="text-primary" /> Review & Edit Cards ({draftCards.length})</h3>

          <div className="space-y-4">
            
            {/* כפתורי הוספה "מרחפים" - מוסתרים בברירת מחדל */}
            <div className="flex justify-center -my-2 relative z-10 opacity-0 hover:opacity-100 transition-all">
              <button onClick={() => setAddingCardAtIndex(-1)} className="bg-white border-2 border-purple-200 text-purple-600 px-6 py-2 rounded-full font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                <PlusCircle size={14} /> Add Card Here
              </button>
            </div>
            
            {addingCardAtIndex === -1 && (
              <div className="my-6">
                <CardEditor initialData={null} onSave={(c) => saveNewCard(-1, c)} onCancel={() => setAddingCardAtIndex(null)} grammarRuleId={selectedRuleId} targetVocabIds={selectedTargetVocab} />
              </div>
            )}

            {draftCards.map((card, idx) => (
              <React.Fragment key={idx}>
                {editingCardIndex === idx ? (
                  <div className="my-6">
                    <CardEditor 
                      initialData={card} onSave={(c) => saveEditedCard(idx, c)} onCancel={() => setEditingCardIndex(null)}
                      grammarRuleId={selectedRuleId} targetVocabIds={selectedTargetVocab}
                    />
                  </div>
                ) : (
                  <div className="p-8 border-2 border-slate-100 rounded-[2rem] bg-white flex shadow-sm relative group hover:border-purple-200 transition-all my-4">
                    
                    {/* כפתורי עריכה/מחיקה - מוסתרים בהתחלה ומופיעים בהובר על הכרטיסיה! */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => setEditingCardIndex(idx)} className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-200 rounded-xl transition-all shadow-sm"><Edit2 size={18} /></button>
                      <button onClick={() => deleteCard(idx)} className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                    </div>

                    <div className="bg-slate-50 text-slate-300 font-black text-3xl h-20 w-20 flex items-center justify-center rounded-3xl mr-8 shrink-0 border border-slate-100">{idx + 1}</div>
                    <div className="flex-1 pr-24">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-slate-100 text-slate-500 inline-block mb-4">{card.type}</span>
                      {card.type === "concept" && <div dir="rtl"><h5 className="font-black text-2xl mb-2"><bdi>{card.title}</bdi></h5><p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line"><bdi>{card.text}</bdi></p></div>}
                      {card.type === "flashcard" && <div className="flex flex-wrap gap-4 items-center" dir="ltr"><span className="text-4xl font-black text-slate-800"><bdi>{card.word}</bdi></span><span className="text-slate-400 text-3xl font-medium"><bdi>{card.translation}</bdi></span></div>}
                      {(card.type === "multiple_choice" || card.type === "build_sentence") && <div dir="rtl"><p className="font-black text-2xl mb-4 text-slate-800"><bdi>{card.question}</bdi></p><div className="bg-green-50 border-2 border-green-100 text-green-700 font-black px-6 py-4 rounded-2xl mt-4 inline-block text-lg">✓ <bdi>{Array.isArray(card.correctAnswer) ? card.correctAnswer.join(" ") : card.correctAnswer}</bdi></div></div>}
                    </div>
                  </div>
                )}

                <div className="flex justify-center -my-2 relative z-10 opacity-0 hover:opacity-100 transition-all">
                  <button onClick={() => setAddingCardAtIndex(idx)} className="bg-white border-2 border-purple-200 text-purple-600 px-6 py-2 rounded-full font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 uppercase tracking-widest">
                    <PlusCircle size={14} /> Add Card Here
                  </button>
                </div>

                {addingCardAtIndex === idx && (
                  <div className="my-6">
                    <CardEditor initialData={null} onSave={(c) => saveNewCard(idx, c)} onCancel={() => setAddingCardAtIndex(null)} grammarRuleId={selectedRuleId} targetVocabIds={selectedTargetVocab} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionBuilder;