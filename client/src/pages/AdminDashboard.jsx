import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookText, Wand2, ArrowLeft, Database } from 'lucide-react';
import VocabularyManager from '../components/VocabularyManager';
import RulesManager from '../components/RulesManager';
import MissionBuilder from '../components/MissionBuilder';
import MissionsManager from '../components/MissionsManager'; // קומפוננטה חדשה למחיקת שיעורים

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  
  // שומרים את השפה ברמת הפאנל, וזוכרים אותה בזיכרון של הדפדפן (localStorage)
  const [globalLang, setGlobalLang] = useState(localStorage.getItem('adminGlobalLang') || 'en');

  const handleLangChange = (lang) => {
    setGlobalLang(lang);
    localStorage.setItem('adminGlobalLang', lang);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar - העיצוב המקורי שלך! */}
      <div className="w-72 bg-white border-r border-slate-200 p-8 flex flex-col shadow-sm z-10">
        <div className="flex items-center space-x-3 mb-12 cursor-pointer text-slate-400 hover:text-slate-800 transition-colors" onClick={() => navigate('/dashboard')}>
          <div className="bg-slate-100 p-2 rounded-full"><ArrowLeft size={18} /></div>
          <span className="font-bold tracking-wide text-sm uppercase">Exit Admin</span>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Studio<span className="text-primary">.</span></h2>
        
        <nav className="space-y-3 flex-1">
          <button onClick={() => setActiveTab('generator')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'generator' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Wand2 size={22} /> <span>Mission Builder</span>
          </button>
          <button onClick={() => setActiveTab('vocabulary')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'vocabulary' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookOpen size={22} /> <span>Vocabulary</span>
          </button>
          <button onClick={() => setActiveTab('rules')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'rules' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <BookText size={22} /> <span>Grammar Rules</span>
          </button>
          {/* הטאב החדש לניהול מחיקת שיעורים */}
          <button onClick={() => setActiveTab('missions')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'missions' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Database size={22} /> <span>Manage Missions</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area - מעבירים את השפה לכולם */}
      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'generator' && <MissionBuilder globalLang={globalLang} setGlobalLang={handleLangChange} />}
        {activeTab === 'vocabulary' && <VocabularyManager globalLang={globalLang} setGlobalLang={handleLangChange} />}
        {activeTab === 'rules' && <RulesManager globalLang={globalLang} setGlobalLang={handleLangChange} />}
        {activeTab === 'missions' && <MissionsManager globalLang={globalLang} setGlobalLang={handleLangChange} />}
      </div>
    </div>
  );
};

export default AdminDashboard;