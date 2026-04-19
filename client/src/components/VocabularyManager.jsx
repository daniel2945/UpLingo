import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import API_CALL from '../api/API_CALL';

const VocabularyManager = () => {
  const [vocabList, setVocabList] = useState([]);
  const [newWord, setNewWord] = useState({ word: '', translation: '', type: 'noun', level: 'A1' });

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = async () => {
    try {
      const data = await API_CALL('/admin/vocabulary');
      setVocabList(data);
    } catch (err) {
      console.error("Failed to fetch vocabulary", err);
    }
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    try {
      await API_CALL('/admin/vocabulary', 'POST', newWord);
      setNewWord({ word: '', translation: '', type: 'noun', level: 'A1' });
      fetchVocabulary();
    } catch (err) {
      alert("Failed to add word");
    }
  };

  const handleDeleteWord = async (id) => {
    if (!window.confirm("Delete this word?")) return;
    try {
      await API_CALL(`/admin/vocabulary/${id}`, 'DELETE');
      fetchVocabulary();
    } catch (err) {
      alert("Failed to delete word");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Vocabulary Bank</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage the global dictionary for your lessons.</p>
      </div>

      <form onSubmit={handleAddWord} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">Word</label>
          <input required type="text" value={newWord.word} onChange={e => setNewWord({...newWord, word: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none" placeholder="e.g. Perro" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">Translation</label>
          <input required type="text" value={newWord.translation} onChange={e => setNewWord({...newWord, translation: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none" placeholder="כלב" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
          <select value={newWord.type} onChange={e => setNewWord({...newWord, type: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none min-w-[120px]">
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
          <select value={newWord.level} onChange={e => setNewWord({...newWord, level: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none min-w-[100px]">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
        </div>
        <button type="submit" className="bg-primary text-white p-4 rounded-xl font-bold hover:bg-primary-dark transition-colors h-[52px] w-[52px] flex items-center justify-center shadow-lg shadow-primary/30">
          <Plus size={24} />
        </button>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Word</th>
              <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Translation</th>
              <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Type</th>
              <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
              <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {vocabList.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-black text-slate-800 text-lg">{item.word}</td>
                <td className="p-5 text-slate-600 font-medium">{item.translation}</td>
                <td className="p-5"><span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">{item.type}</span></td>
                <td className="p-5">{item.isTaught ? <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Taught ✓</span> : <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Pending</span>}</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDeleteWord(item._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {vocabList.length === 0 && (
              <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-medium">No vocabulary words added yet. Start building your dictionary.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VocabularyManager;