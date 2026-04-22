import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API_CALL from '../api/API_CALL';
import useAuthStore from '../store/authStore';
import useLearningStore from '../store/learningStore';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lightbulb } from 'lucide-react';

const Lesson = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const language = useLearningStore((state) => state.language);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [wordBank, setWordBank] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  // 1. שליפת הנתונים
  const { data: mission, isLoading, error } = useQuery({
    queryKey: ['mission', missionId, language],
    queryFn: () => API_CALL(`/missions/${missionId}?lang=${language}`),
    enabled: !!missionId && !!language,
  });

  // 2. מוטציה לסיום משימה
  const completeMutation = useMutation({
    mutationFn: (missionOrder) => API_CALL(`/missions/complete`, 'POST', { 
      missionOrder, 
      language 
    }),
    onSuccess: async () => {
      await fetchProfile();
      queryClient.invalidateQueries(['progress', language]);
      navigate('/dashboard');
    }
  });

  // 3. איפוס וניהול מצב הכרטיסיות
  useEffect(() => {
    if (!mission || !mission.cards || !mission.cards[currentCardIndex]) return;
    const currentCard = mission.cards[currentCardIndex];
    
    setStatus('idle');
    setErrorMessage('');
    
    if (currentCard.type === 'multiple_choice') {
      setSelectedOption(null);
    } else if (currentCard.type === 'build_sentence') {
      setWordBank(currentCard.options.map((text, id) => ({ id, text })));
      setSelectedWords([]);
    }
  }, [currentCardIndex, mission]);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 size={48} className="text-primary animate-spin mb-4" />
      <h2 className="text-xl font-bold">טוען שיעור...</h2>
    </div>
  );

  if (error || !mission) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-xl font-bold">{error?.message || "המשימה לא נמצאה"}</h2>
      <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary font-bold">חזרה לדאשבורד</button>
    </div>
  );

  const currentCard = mission.cards[currentCardIndex];
  const progressPercentage = (currentCardIndex / mission.cards.length) * 100;
  const showCheckButton = ['multiple_choice', 'build_sentence'].includes(currentCard.type) && status !== 'success';

  const moveWord = (word, fromBank) => {
    if (status === 'success') return;
    if (status === 'error') setStatus('idle');

    if (fromBank) {
      setWordBank(wordBank.filter(w => w.id !== word.id));
      setSelectedWords([...selectedWords, word]);
    } else {
      setSelectedWords(selectedWords.filter(w => w.id !== word.id));
      setWordBank([...wordBank, word]);
    }
  };

  const handleCheck = () => {
    if (currentCard.type === 'multiple_choice') {
      if (selectedOption === currentCard.correctAnswer) setStatus('success');
      else {
        setStatus('error');
        setErrorMessage(`התשובה הנכונה: ${currentCard.correctAnswer}`);
      }
    } else if (currentCard.type === 'build_sentence') {
      const userSentence = selectedWords.map(w => w.text).join(' ');
      const correctSentence = currentCard.correctAnswer.join(' ');
      if (userSentence === correctSentence) setStatus('success');
      else {
        setStatus('error');
        setErrorMessage(`המשפט הנכון: ${correctSentence}`);
      }
    }
  };

  const handleContinue = () => {
    if (currentCardIndex === mission.cards.length - 1) {
      completeMutation.mutate(mission.missionOrder);
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Progress Header */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden ml-4">
            <div 
              className="bg-green-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center pb-40">
        {currentCard.type === 'concept' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-6 text-right" dir="rtl">
            <div className="flex items-center space-x-2 text-blue-600 mb-2" dir="ltr">
              <Lightbulb size={24} /> <span className="font-black uppercase tracking-wider">Concept</span>
            </div>
            <h1 className="text-3xl font-black text-gray-800">{currentCard.title}</h1>
            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100 text-xl text-gray-600 leading-relaxed whitespace-pre-wrap">
              {currentCard.text}
            </div>
          </div>
        )}

        {currentCard.type === 'flashcard' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 text-center space-y-8">
            <span className="text-purple-500 font-black tracking-widest uppercase text-sm">New Word</span>
            <div className="bg-white w-full p-16 rounded-[3rem] shadow-sm border-b-8 border-gray-200 space-y-6">
              <h1 className="text-6xl font-black text-gray-800 tracking-tight">{currentCard.word}</h1>
              <div className="h-1 w-16 bg-gray-100 mx-auto rounded-full"></div>
              <p className="text-3xl text-gray-400 font-medium">{currentCard.translation}</p>
            </div>
          </div>
        )}

        {currentCard.type === 'multiple_choice' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
            <h2 className="text-2xl font-black text-gray-800 text-center" dir="auto">{currentCard.question}</h2>
            <div className="grid gap-3">
              {currentCard.options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => status !== 'success' && setSelectedOption(opt)}
                  className={`p-5 text-xl font-bold rounded-2xl border-2 transition-all ${
                    selectedOption === opt 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentCard.type === 'build_sentence' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-gray-800 text-center" dir="auto">{currentCard.question}</h2>
            <div className="min-h-[100px] border-b-2 border-dashed border-gray-300 flex flex-wrap gap-2 p-4 items-center justify-center">
              {selectedWords.map(word => (
                <button key={word.id} onClick={() => moveWord(word, false)} className="bg-white border-2 border-gray-200 px-5 py-3 rounded-xl font-bold text-lg shadow-sm">
                  {word.text}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {wordBank.map(word => (
                <button key={word.id} onClick={() => moveWord(word, true)} className="bg-white border-2 border-gray-200 border-b-4 px-5 py-3 rounded-xl font-bold text-lg hover:-translate-y-0.5 transition-all">
                  {word.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Action Footer */}
      <footer className={`fixed bottom-0 w-full p-6 border-t-2 transition-colors ${
        status === 'success' ? 'bg-green-50 border-green-100' : 
        status === 'error' ? 'bg-red-50 border-red-100' : 'bg-white'
      }`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            {status === 'success' && <div className="text-green-700 font-black text-xl flex items-center gap-2"><CheckCircle2 /> מעולה!</div>}
            {status === 'error' && <div className="text-red-700 font-bold text-sm">{errorMessage}</div>}
          </div>
          <button
            onClick={showCheckButton ? handleCheck : handleContinue}
            disabled={completeMutation.isPending || (showCheckButton && !selectedOption && selectedWords.length === 0)}
            className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
              status === 'success' ? 'bg-green-500 text-white shadow-green-200 shadow-lg' : 'bg-primary text-white'
            } disabled:opacity-50`}
          >
            {completeMutation.isPending ? <Loader2 className="animate-spin" /> : showCheckButton ? 'Check' : 'Continue'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Lesson;