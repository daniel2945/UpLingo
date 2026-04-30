import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../store/authStore';
import useLearningStore from '../store/learningStore';
import API_CALL from '../api/API_CALL';
import { Play, Book, Award, Lock, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  
  // אנחנו שולפים מ-Zustand רק את השפה שבחרנו. את הנתונים נמשוך ב-React Query!
  const { language } = useLearningStore();

  // 1. משיכת המשימות
  const { data: missions = [], isLoading: isLoadingMissions } = useQuery({
    queryKey: ['missions', language],
    queryFn: () => API_CALL(`/missions?lang=${language}`),
    enabled: !!language,
  });

  // 2. משיכת ההתקדמות (עכשיו זה חסין מבאגים של Cache!)
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['progress', language],
    queryFn: () => API_CALL(`/users/progress?lang=${language}`),
    enabled: !!language,
  });

  if (!user) return null;

  // חילוץ בטוח של הנתונים מהשרת
  const actualProgress = progressData?.progress || progressData;
  const currentOrder = actualProgress?.currentMissionOrder || 1;
  const sandbox = actualProgress?.sandbox || [];

  // חיפוש המשימה הבאה לביצוע
  const nextMission = missions.find(m => m.missionOrder === currentOrder) || missions[0];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Hero Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-black text-gray-800">Hi, {user.username}! 👋</h2>
          <p className="text-gray-500 text-lg">You're on mission <span className="font-bold text-primary">#{currentOrder}</span>. Ready to learn?</p>
          <button
            disabled={!nextMission}
            onClick={() => nextMission && navigate(`/lesson/${nextMission._id}`)}
            className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl border-b-4 border-primary-dark flex items-center space-x-2 mx-auto md:mx-0 shadow-lg disabled:opacity-50 transition-all transform hover:scale-105"
          >
            <Play fill="white" size={20} />
            <span>{nextMission ? 'START NEXT LESSON' : 'NO MISSIONS YET'}</span>
          </button>
        </div>
        <div className="bg-primary/10 p-6 rounded-full shrink-0">
          <Award size={120} className="text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mission Map */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-black text-gray-700 uppercase tracking-wider">Mission Map</h3>
          <div className="bg-white rounded-3xl p-8 border-b-4 border-gray-200 space-y-12 flex flex-col items-center relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gray-100 -z-0"></div>
            
            {(isLoadingMissions || isLoadingProgress) && <div className="z-10 bg-white px-4 py-2 rounded-xl text-gray-400 font-bold shadow-sm flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> טוען מפה...</div>}
            {!isLoadingMissions && missions.length === 0 && <div className="z-10 bg-white px-4 py-2 rounded-xl text-gray-400 font-bold shadow-sm">אין עדיין שיעורים בשפה זו.</div>}
            
            {missions.sort((a, b) => a.missionOrder - b.missionOrder).map((mission) => {
              const isCurrent = mission.missionOrder === currentOrder;
              const isPast = mission.missionOrder < currentOrder;
              const isLocked = mission.missionOrder > currentOrder;
              
              return (
                <div key={mission._id} className="relative z-10 w-full flex justify-center group">
                  <button
                    disabled={isLocked}
                    onClick={() => navigate(`/lesson/${mission._id}`)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-b-8 transition-all transform 
                      ${!isLocked && 'hover:scale-110'}
                      ${isCurrent ? 'bg-primary border-primary-dark text-white shadow-xl ring-4 ring-primary/30' : 
                        isPast ? 'bg-secondary border-secondary-dark text-white' : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'}`}
                  >
                    {isLocked ? <Lock size={28} /> : <span className="text-2xl font-black">{mission.missionOrder}</span>}
                  </button>
                  
                  <div className="absolute left-1/2 ml-14 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none flex flex-col">
                    <span className="font-bold text-gray-800">{mission.title}</span>
                    {isLocked && <span className="text-xs text-red-400 font-bold">Locked</span>}
                  </div>

                  {isCurrent && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-3 py-1 rounded-lg uppercase whitespace-nowrap animate-bounce">
                      Current
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-700 uppercase tracking-wider">Vocabulary</h3>
          <div className="bg-white rounded-3xl p-6 border-b-4 border-gray-200 min-h-[400px]">
            {sandbox && sandbox.length > 0 ? (
              <div className="space-y-3">
                {sandbox.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                    <div>
                      <div className="font-bold text-gray-800">{item.word || item.vocabularyId?.word}</div>
                      <div className="text-xs text-gray-400 font-black">{item.translation || item.vocabularyId?.translation}</div>
                    </div>
                    <div className="bg-accent/20 text-accent-dark px-2 py-1 rounded-lg text-sm font-black">
                      {item.score} XP
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-full">
                  <Book size={48} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Complete lessons to build your vocabulary!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;