import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_CALL from '../api/API_CALL';
import useAuthStore from '../store/authStore';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Lightbulb } from 'lucide-react';

const Lesson = () => {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Carousel State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [status, setStatus] = useState('idle');
  
  // Interactive Cards State
  const [selectedOption, setSelectedOption] = useState(null);
  const [wordBank, setWordBank] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const data = await API_CALL(`/missions/${missionId}`);
        setMission(data);
      } catch (err) {
        console.error('Failed to fetch mission', err);
        setErrorMessage(err.response?.data?.message || 'Mission not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, [missionId]);

  useEffect(() => {
    if (!mission) return;
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

  const handleCheck = () => {
    const currentCard = mission.cards[currentCardIndex];
    
    if (currentCard.type === 'multiple_choice') {
      if (selectedOption === currentCard.correctAnswer) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(`התשובה הנכונה היא: ${currentCard.correctAnswer}`);
      }
    } 
    
    else if (currentCard.type === 'build_sentence') {
      const userSentence = selectedWords.map(w => w.text).join(' ');
      const correctSentence = currentCard.correctAnswer.join(' ');
      
      if (userSentence === correctSentence) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(`המשפט הנכון הוא: ${correctSentence}`);
      }
    }
  };

  const handleContinue = async () => {
    const isLastCard = currentCardIndex === mission.cards.length - 1;

    if (isLastCard) {
      try {
        setStatus('submitting');
        await API_CALL(`/missions/complete`, 'POST', { missionOrder: mission.missionOrder });
        await fetchProfile();
        navigate('/dashboard');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Server connection error.');
        setTimeout(() => setStatus('success'), 3000);
      }
    } else {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

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

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans"><Loader2 size={48} className="text-primary animate-spin mb-4" /><h2 className="text-xl font-bold">טוען שיעור...</h2></div>;
  if (errorMessage && !mission) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans"><AlertCircle size={48} className="text-red-500 mb-4" /><h2 className="text-xl font-bold">{errorMessage}</h2><button onClick={() => navigate('/dashboard')} className="mt-4 text-primary font-bold">חזור לדאשבורד</button></div>;

  const currentCard = mission.cards[currentCardIndex];
  const progressPercentage = ((currentCardIndex) / mission.cards.length) * 100;
  
  const isInteractiveCard = ['multiple_choice', 'build_sentence'].includes(currentCard.type);
  const isReadyToCheck = 
    (currentCard.type === 'multiple_choice' && selectedOption) || 
    (currentCard.type === 'build_sentence' && selectedWords.length > 0);
  const showCheckButton = isInteractiveCard && status !== 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header & Progress Bar */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <button onClick={() => window.confirm("לצאת באמצע השיעור? ההתקדמות לא תישמר.") && navigate('/dashboard')} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Content (Card Area) */}
{/* Main Content (Card Area) */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col justify-center pb-40">
        
        {/* --- TYPE: CONCEPT --- */}
        {currentCard.type === 'concept' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-6" dir="rtl">
            <div className="flex items-center space-x-3 text-blue-600 mb-2" dir="ltr">
              {/* השארנו את התגית קונספט באנגלית משמאל */}
              <Lightbulb size={28} /> <span className="font-black text-xl uppercase tracking-wider font-sans ml-2">Concept</span>
            </div>
            <h1 className="text-3xl font-black text-gray-800 leading-tight font-sans text-right">
              {currentCard.title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 font-sans text-right whitespace-pre-wrap">
              {currentCard.text}
            </p>
          </div>
        )}

        {/* --- TYPE: FLASHCARD --- */}
        {currentCard.type === 'flashcard' && (
          <div className="animate-in slide-in-from-right-8 duration-500 flex flex-col items-center text-center space-y-8">
            <span className="text-purple-500 font-black tracking-widest uppercase font-sans">New Word</span>
            <div className="bg-white w-full p-12 rounded-[3rem] shadow-sm border-b-8 border-gray-200 space-y-6 transform transition-transform hover:scale-105 cursor-default">
              <h1 dir="ltr" className="text-6xl font-black text-gray-800 font-sans">{currentCard.word}</h1>
              <div className="h-px w-24 bg-gray-200 mx-auto"></div>
              <p dir="rtl" className="text-3xl font-medium text-gray-500 font-sans">{currentCard.translation}</p>
            </div>
          </div>
        )}

        {/* --- TYPE: MULTIPLE CHOICE --- */}
        {currentCard.type === 'multiple_choice' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-8">
            <h2 dir="rtl" className="text-3xl font-black text-gray-800 font-sans text-center">
              {currentCard.question}
            </h2>
            <div className="grid grid-cols-1 gap-4" dir="ltr">
              {/* את הכפתורים באמריקאית אנחנו שמים ltr כי התשובות הן לרוב בספרדית */}
              {currentCard.options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => { if (status !== 'success') { setSelectedOption(opt); setStatus('idle'); } }}
                  className={`p-6 text-xl font-bold rounded-2xl border-b-4 transition-all text-left font-sans ${
                    selectedOption === opt 
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-inner' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  } ${status === 'success' && selectedOption === opt ? 'bg-green-50 border-green-500 text-green-700' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- TYPE: BUILD SENTENCE --- */}
        {currentCard.type === 'build_sentence' && (
          <div className="animate-in slide-in-from-right-8 duration-500 space-y-10">
            <h2 dir="rtl" className="text-3xl font-black text-gray-800 font-sans text-center">
              {currentCard.question}
            </h2>
            
            {/* Drop Zone (Selected Words) - תמיד משמאל לימין כי בונים משפט בספרדית */}
            <div className="min-h-[80px] border-b-2 border-gray-300 flex flex-wrap gap-2 pb-4 items-end" dir="ltr">
              {selectedWords.map(word => (
                <button 
                  key={word.id} 
                  onClick={() => moveWord(word, false)}
                  className="bg-white border-2 border-gray-200 text-gray-800 px-5 py-3 rounded-2xl font-bold text-xl shadow-sm hover:bg-gray-50 transition-all font-sans"
                >
                  {word.text}
                </button>
              ))}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center pt-6" dir="ltr">
              {wordBank.map(word => (
                <button 
                  key={word.id} 
                  onClick={() => moveWord(word, true)}
                  className="bg-white border-2 border-gray-200 border-b-4 text-gray-800 px-6 py-4 rounded-2xl font-bold text-xl shadow-sm hover:-translate-y-1 hover:border-gray-300 transition-all active:translate-y-0 active:border-b-2 font-sans"
                >
                  {word.text}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Action Bar (Footer) */}
      <div className={`fixed bottom-0 left-0 right-0 p-6 border-t-2 transition-colors duration-300 ${
        status === 'success' ? 'bg-green-100 border-green-200' : 
        status === 'error' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-4">
            {status === 'success' && (
              <div className="flex items-center space-x-3 text-green-700 animate-in slide-in-from-left-4">
                <div className="bg-green-500 text-white p-2 rounded-full"><CheckCircle2 size={32} /></div>
                <p className="font-black text-2xl uppercase tracking-tight font-sans">Excellent!</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center space-x-3 text-red-700 animate-in slide-in-from-left-4">
                <div className="bg-red-500 text-white p-2 rounded-full"><AlertCircle size={32} /></div>
                <div>
                  <p className="font-black text-xl uppercase tracking-tight font-sans">Not quite</p>
                  <p dir="auto" className="font-bold text-sm opacity-90 font-sans">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={showCheckButton ? handleCheck : handleContinue}
            disabled={status === 'submitting' || (showCheckButton && !isReadyToCheck)}
            className={`px-12 py-4 rounded-2xl font-black border-b-4 transition-all uppercase tracking-widest shadow-lg text-xl min-w-[200px] font-sans
              ${(showCheckButton && !isReadyToCheck) ? 'bg-gray-200 border-gray-300 text-gray-400' : 
                status === 'success' ? 'bg-green-500 border-green-600 text-white hover:bg-green-400' :
                status === 'error' ? 'bg-red-500 border-red-600 text-white hover:bg-red-400' :
                'bg-blue-500 hover:bg-blue-400 border-blue-600 text-white'}`}
          >
            {status === 'submitting' ? <Loader2 className="animate-spin mx-auto" /> : 
             showCheckButton ? 'Check' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lesson;