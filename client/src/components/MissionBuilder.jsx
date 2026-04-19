import React, { useState, useEffect } from 'react';
import { Wand2, Loader2, Save, Check, BookOpen, Sparkles } from 'lucide-react';
import API_CALL from '../api/API_CALL'; // שים לב לנתיב, בהתאם לאיפה ששמת את הקובץ

const MissionBuilder = () => {
  const [vocabList, setVocabList] = useState([]);
  const [rulesList, setRulesList] = useState([]);
  
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [selectedTargetVocab, setSelectedTargetVocab] = useState([]);
  const [selectedReviewVocab, setSelectedReviewVocab] = useState([]);
  const [draftCards, setDraftCards] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Publish States
  const [missionTitle, setMissionTitle] = useState('');
  const [missionOrder, setMissionOrder] = useState(1);

  // טעינת נתונים ראשונית (כולל המספר הבא בתור)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vocabData, rulesData, orderData] = await Promise.all([
          API_CALL('/admin/vocabulary'),
          API_CALL('/admin/rules'),
          API_CALL('/admin/missions/next-order').catch(() => ({ nextOrder: 1 })) // מונע קריסה אם הראוט עדיין לא קיים
        ]);
        setVocabList(vocabData);
        setRulesList(rulesData);
        if (orderData?.nextOrder) setMissionOrder(orderData.nextOrder);
      } catch (err) { 
        console.error("Error fetching data", err); 
      }
    };
    fetchData();
  }, []);

  const toggleVocabSelection = (id, listType) => {
    if (listType === 'target') {
      setSelectedTargetVocab(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    } else {
      setSelectedReviewVocab(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    }
  };

  const handleGenerateDraft = async () => {
    if (!selectedRuleId || selectedTargetVocab.length === 0) return alert("Select a rule and target words!");
    setIsGenerating(true);
    try {
      const response = await API_CALL('/admin/missions/generate', 'POST', {
        grammarRuleId: selectedRuleId, targetVocabIds: selectedTargetVocab, reviewVocabIds: selectedReviewVocab
      });
      setDraftCards(response.draftCards);
      
      setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 300);
    } catch (err) { alert("Failed to generate. Check console."); } 
    finally { setIsGenerating(false); }
  };

  const handlePublishMission = async () => {
    if (!missionTitle || !draftCards) return alert("Please enter a title for the mission!");
    try {
      await API_CALL('/admin/missions/publish', 'POST', {
        missionOrder: missionOrder, 
        title: missionTitle,
        grammarRuleId: selectedRuleId, 
        targetVocabIds: selectedTargetVocab, 
        reviewVocabIds: selectedReviewVocab, 
        finalCards: draftCards
      });
      alert("🎉 Mission Published Successfully!");
      
      // איפוס אחרי פרסום מוצלח
      setDraftCards(null); 
      setMissionTitle(''); 
      setSelectedTargetVocab([]); 
      setSelectedReviewVocab([]);
      setMissionOrder(prev => prev + 1); // מקדם אוטומטית את המספר לשיעור הבא
      
      // רענון אוצר המילים כדי שייצבע בירוק ("Taught")
      const updatedVocab = await API_CALL('/admin/vocabulary');
      setVocabList(updatedVocab);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) { 
      console.error("PUBLISH ERROR DETAIL:", err);
      alert("Failed to publish. Check console."); 
    }
  };

  return (
    <div className="w-full mx-auto space-y-12 animate-in fade-in duration-500 pb-24">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="text-primary" size={36} /> Mission Builder
        </h1>
        <p className="text-slate-500 mt-3 text-lg">Define parameters, let AI generate the content, review, and publish.</p>
      </div>
      
      {/* Configuration Steps */}
      <div className="space-y-8">
        
        {/* Step 1: Rule */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0">1</span>
            <span>Core Grammar Rule</span>
          </label>
          <select value={selectedRuleId} onChange={e => setSelectedRuleId(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-medium text-lg text-slate-700 transition-colors cursor-pointer">
            <option value="">-- Choose Rule from Library --</option>
            {rulesList.map(r => <option key={r._id} value={r._id}>{r.ruleName} ({r.level}) {r.isTaught ? '✓' : ''}</option>)}
          </select>
        </div>

        {/* Step 2: Target Words */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0">2</span>
            <span>New Words to Teach</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {vocabList.filter(v => !v.isTaught).map(v => {
              const isSelected = selectedTargetVocab.includes(v._id);
              return (
                <button key={v._id} onClick={() => toggleVocabSelection(v._id, 'target')} className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all border-2 flex items-center space-x-3 ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-sm transform scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {isSelected && <Check size={20} />} <span dir="auto">{v.word}</span> <span dir="auto" className="text-sm font-normal opacity-60">({v.translation})</span>
                </button>
              );
            })}
            {vocabList.filter(v => !v.isTaught).length === 0 && <p className="text-slate-400 text-lg">No pending words available in dictionary.</p>}
          </div>
        </div>

        {/* Step 3: Review Words */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="flex items-center space-x-4 font-black text-slate-800 mb-6 text-xl">
            <span className="bg-amber-100 text-amber-600 w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0">3</span>
            <span>Review Words (Optional)</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {vocabList.filter(v => v.isTaught).map(v => {
              const isSelected = selectedReviewVocab.includes(v._id);
              return (
                <button key={v._id} onClick={() => toggleVocabSelection(v._id, 'review')} className={`px-6 py-3 rounded-2xl text-lg font-bold transition-all border-2 flex items-center space-x-3 ${isSelected ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm transform scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {isSelected && <Check size={20} />} <span dir="auto">{v.word}</span> <span dir="auto" className="text-sm font-normal opacity-60">({v.translation})</span>
                </button>
              );
            })}
            {vocabList.filter(v => v.isTaught).length === 0 && <p className="text-slate-400 text-lg">No taught words to review yet.</p>}
          </div>
        </div>

      </div>

      {/* Generate Button */}
      <div className="flex justify-center py-8">
        <button onClick={handleGenerateDraft} disabled={isGenerating} className="bg-slate-900 text-white px-14 py-6 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all shadow-lg flex items-center space-x-4 disabled:opacity-50 disabled:hover:translate-y-0">
          {isGenerating ? <Loader2 className="animate-spin" size={32} /> : <Wand2 size={32} />}
          <span>{isGenerating ? 'AI is crafting the lesson...' : 'Generate AI Lesson'}</span>
        </button>
      </div>

      {/* Result & Publish Section */}
      {draftCards && (
        <div className="bg-white rounded-[2rem] shadow-xl border-2 border-primary/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-700 mt-12">
          
          <div className="bg-slate-50 p-10 border-b-2 border-primary/10 space-y-6">
            <div className="flex flex-col md:flex-row items-end gap-6">
              
              {/* Mission Order Input */}
              <div className="w-full md:w-32 shrink-0">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Order</label>
                <input 
                  type="number" 
                  value={missionOrder} 
                  onChange={e => setMissionOrder(parseInt(e.target.value) || 1)} 
                  className="w-full p-5 text-2xl font-black border-2 border-slate-200 rounded-2xl focus:border-primary bg-white outline-none transition-all shadow-sm text-center" 
                />
              </div>

              {/* Mission Title Input */}
              <div className="w-full flex-1">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Mission Title (Public)</label>
                <input 
                  type="text" 
                  value={missionTitle} 
                  onChange={e => setMissionTitle(e.target.value)} 
                  placeholder="e.g. Introduction to the verb Ser..." 
                  className="w-full p-5 text-2xl font-black border-2 border-slate-200 rounded-2xl focus:border-primary bg-white outline-none transition-all shadow-sm" 
                  dir="auto"
                />
              </div>

              {/* Publish Button */}
              <button onClick={handlePublishMission} className="w-full md:w-auto bg-green-500 text-white px-12 py-5 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-green-600 hover:shadow-xl transition-all shrink-0 h-[76px]">
                <Save size={28} /> <span>Publish Mission</span>
              </button>
            </div>
          </div>
          
          <div className="p-10 bg-slate-50/50">
            <h3 className="font-black text-2xl text-slate-800 mb-8 flex items-center gap-3">
              <BookOpen className="text-primary" size={28} /> Review Generated Cards ({draftCards.length})
            </h3>
            <div className="space-y-6">
              {draftCards.map((card, idx) => (
                <div key={idx} className="p-8 border-2 border-slate-100 rounded-3xl bg-white flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-8 shadow-sm">
                  <div className="bg-slate-100 text-slate-400 font-black text-2xl h-16 w-16 flex items-center justify-center rounded-2xl shrink-0">{idx + 1}</div>
                  <div className="w-full">
                    <span className={`text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl inline-block mb-4 ${
                      card.type === 'concept' ? 'bg-blue-100 text-blue-700' :
                      card.type === 'flashcard' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                    }`}>{card.type.replace('_', ' ')}</span>
                    
                    {card.type === 'concept' && <div>
                      <p className="font-black text-slate-800 text-2xl" dir="auto">{card.title}</p>
                      <p className="text-slate-600 mt-3 leading-relaxed text-xl" dir="auto">{card.text}</p>
                    </div>}
                    
                    {card.type === 'flashcard' && <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="text-4xl font-black text-slate-800" dir="auto">{card.word}</span>
                      <span className="text-slate-400 font-medium text-3xl" dir="auto">{card.translation}</span>
                    </div>}
                    
                    {(card.type === 'multiple_choice' || card.type === 'build_sentence') && <div>
                      <p className="font-bold text-slate-800 text-2xl" dir="auto">{card.question}</p>
                      <div className="bg-green-50 text-green-700 border border-green-200 font-bold px-5 py-3 rounded-2xl mt-4 inline-block text-lg" dir="auto">
                        ✓ Answer: {Array.isArray(card.correctAnswer) ? card.correctAnswer.join(' ') : card.correctAnswer}
                      </div>
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default MissionBuilder;