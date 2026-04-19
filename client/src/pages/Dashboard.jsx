import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Play, Book, Award } from 'lucide-react';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-black text-gray-800">Hi, {user.username}! 👋</h2>
          <p className="text-gray-500 text-lg">You're on mission <span className="font-bold text-primary">#{user.currentMissionOrder || 1}</span>. Ready to learn some new words?</p>
          <button
            onClick={() => navigate(`/lesson/${user.currentMissionOrder || 1}`)}
            className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl border-b-4 border-primary-dark flex items-center space-x-2 mx-auto md:mx-0 shadow-lg"
          >
            <Play fill="white" size={20} />
            <span>START NEXT LESSON</span>
          </button>
        </div>
        <div className="bg-primary/10 p-6 rounded-full">
          <Award size={120} className="text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mission Map Placeholder */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-black text-gray-700 uppercase tracking-wider">Mission Map</h3>
          <div className="bg-white rounded-3xl p-8 border-b-4 border-gray-200 space-y-12 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-gray-100 -z-0"></div>
            
            {[1, 2, 3].map((order) => {
              const isCurrent = order === (user.currentMissionOrder || 1);
              const isPast = order < (user.currentMissionOrder || 1);
              
              return (
                <div key={order} className="relative z-10">
                  <button
                    disabled={!isCurrent && !isPast}
                    onClick={() => navigate(`/lesson/${order}`)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-b-8 transition-all transform hover:scale-110
                      ${isCurrent ? 'bg-primary border-primary-dark text-white shadow-xl ring-4 ring-primary/30' : 
                        isPast ? 'bg-secondary border-secondary-dark text-white' : 'bg-gray-200 border-gray-300 text-gray-400'}`}
                  >
                    <span className="text-2xl font-black">{order}</span>
                  </button>
                  {isCurrent && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-black px-3 py-1 rounded-lg uppercase whitespace-nowrap animate-bounce">
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
            {user.sandbox && user.sandbox.length > 0 ? (
              <div className="space-y-3">
                {user.sandbox.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border-2 border-gray-100">
                    <div>
                      <div className="font-bold text-gray-800">{item.word}</div>
                      <div className="text-xs text-gray-400 uppercase font-black">{item.type}</div>
                    </div>
                    <div className="bg-accent/20 text-accent-dark px-2 py-1 rounded-lg text-sm font-black">
                      {item.score}%
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
