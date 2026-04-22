import React, { useState, useEffect } from 'react';
import { Trash2, Globe } from 'lucide-react';
import API_CALL from '../api/API_CALL';

const RulesManager = () => {
  // רשימת השפות - זהה למה שעשינו ב-Builder
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' }
  ];

  const [selectedLang, setSelectedLang] = useState('en');
  const [rulesList, setRulesList] = useState([]);
  const [newRule, setNewRule] = useState({ 
    ruleName: '', 
    level: 'A1', 
    adminNotes: '', 
    aiInstruction: '' 
  });

  // טעינה מחדש בכל פעם שהשפה משתנה
  useEffect(() => {
    fetchRules();
  }, [selectedLang]);

  const fetchRules = async () => {
    try {
      // שליפה עם Query Parameter של השפה
      const data = await API_CALL(`/admin/rules?lang=${selectedLang}`);
      setRulesList(data);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      // מוסיפים את השפה הנבחרת לאובייקט שנשלח לשרת
      const payload = { ...newRule, language: selectedLang };
      await API_CALL('/admin/rules', 'POST', payload);
      
      // איפוס טופס ורענון
      setNewRule({ ruleName: '', level: 'A1', adminNotes: '', aiInstruction: '' });
      fetchRules();
    } catch (err) {
      alert("Failed to add rule");
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await API_CALL(`/admin/rules/${id}`, 'DELETE');
      fetchRules();
    } catch (err) {
      alert("Failed to delete rule");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Selector Tabs - בחירת שפה */}
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button 
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                selectedLang === lang.code ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe size={18} /> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Grammar Rules</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Defining rules for: <span className="font-bold text-slate-700 underline">{selectedLang.toUpperCase()}</span>
        </p>
      </div>

      {/* Form לשמירת חוק חדש */}
      <form onSubmit={handleAddRule} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">Rule Name</label>
            <input required type="text" value={newRule.ruleName} onChange={e => setNewRule({...newRule, ruleName: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none" placeholder={`e.g. Present Tense (${selectedLang})`} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
            <select value={newRule.level} onChange={e => setNewRule({...newRule, level: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none min-w-[120px]">
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Admin Notes (Optional)</label>
          <input type="text" value={newRule.adminNotes} onChange={e => setNewRule({...newRule, adminNotes: e.target.value})} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none" placeholder="Internal notes..." />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">AI Prompt Instruction <span className="text-primary uppercase text-xs ml-2 tracking-wider">Critical</span></label>
          <textarea required value={newRule.aiInstruction} onChange={e => setNewRule({...newRule, aiInstruction: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none h-32 resize-none leading-relaxed" placeholder={`Tell the AI how to explain this in ${selectedLang}...`}></textarea>
        </div>
        <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg">
          Save {selectedLang} Rule
        </button>
      </form>

      {/* רשימת החוקים הקיימים לאותה שפה */}
      <div className="grid gap-6">
        {rulesList.map((rule) => (
          <div key={rule._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-start group">
            <div className="flex-1 pr-8">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-black text-xl text-slate-800">{rule.ruleName}</h3>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{rule.level}</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{rule.language}</span>
              </div>
              {rule.adminNotes && <p className="text-slate-500 text-sm mb-4">{rule.adminNotes}</p>}
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 font-mono border border-slate-100 relative">
                <span className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Prompt Directive</span>
                {rule.aiInstruction}
              </div>
            </div>
            <button onClick={() => handleDeleteRule(rule._id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {rulesList.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No rules defined for this language yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RulesManager;