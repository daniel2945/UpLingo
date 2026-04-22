import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, Check } from 'lucide-react';
import API_CALL from '../api/API_CALL';

const VocabularyManager = () => {
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' }
  ];

  const [selectedLang, setSelectedLang] = useState('en');
  const [vocabList, setVocabList] = useState([]);
  const [newWord, setNewWord] = useState({ word: '', translation: '', type: 'noun', level: 'A1' });

  useEffect(() => {
    fetchVocabulary();
  }, [selectedLang]);

  const fetchVocabulary = async () => {
    try {
      const data = await API_CALL(`/admin/vocabulary?lang=${selectedLang}`);
      setVocabList(data);
    } catch (err) {
      console.error("Failed to fetch vocabulary", err);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newWord, language: selectedLang };
      await API_CALL('/admin/vocabulary', 'POST', payload);
      setNewWord({ word: '', translation: '', type: 'noun', level: 'A1' });
      fetchVocabulary();
    } catch (err) {
      alert("Failed to add word");
    }
  };

  const handleDeleteWord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this word?")) return;
    try {
      await API_CALL(`/admin/vocabulary/${id}`, 'DELETE');
      fetchVocabulary();
    } catch (err) {
      alert("Failed to delete word");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* בחירת שפה - טאבים */}
      <div className="flex justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button 
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                selectedLang === lang.code ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe size={18} /> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Vocabulary Bank</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Dictionary for: <span className="font-bold text-blue-600 underline">{selectedLang.toUpperCase()}</span>
        </p>
      </div>

      {/* טופס הוספה - גמיש (Responsive) */}
      <form onSubmit={handleAddWord} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-sm font-bold text-slate-700 mb-2">Word ({selectedLang})</label>
          <input required type="text" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" placeholder="e.g. Perro" />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm font-bold text-slate-700 mb-2">Translation</label>
          <input required type="text" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none" placeholder="כלב" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
          <select value={newWord.type} onChange={e => setNewWord({...newWord, type: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none">
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
          <select value={newWord.level} onChange={e => setNewWord({...newWord, level: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
            <Plus size={20} /> Add Word
          </button>
        </div>
      </form>

      {/* טבלת המילים - עם גלילה רוחבית למקרה שהמסך קטן */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Word</th>
                <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Translation</th>
                <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Type</th>
                <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vocabList.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 font-black text-slate-800 text-lg">{item.word}</td>
                  <td className="p-5 text-slate-600 font-medium">{item.translation}</td>
                  <td className="p-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-5">
                    {item.isTaught ? 
                      <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                        <Check size={14} /> TAUGHT
                      </span> : 
                      <span className="text-amber-500 font-bold text-xs">PENDING</span>
                    }
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => handleDeleteWord(item._id)} 
                      className="inline-flex items-center justify-center p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Word"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {vocabList.length === 0 && (
          <div className="p-20 text-center text-slate-400">
            <p className="text-lg font-medium">No words found for {selectedLang.toUpperCase()}.</p>
            <p className="text-sm">Start by adding your first word above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyManager;