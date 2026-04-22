import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API_CALL from '../api/API_CALL';

const useLearningStore = create(
  persist(
    (set, get) => ({
      language: 'en', // שפת ברירת מחדל
      progress: null, // כאן יישמרו ה-sandbox וה-currentMissionOrder של השפה הנבחרת

      setLanguage: (lang) => {
        set({ language: lang, progress: null }); // כשמחליפים שפה, מאפסים התקדמות זמנית עד השליפה
      },

      // שליפת התקדמות מהשרת עבור השפה הנוכחית
      fetchProgress: async () => {
        try {
          const lang = get().language;
          // אנחנו נצטרך ראוט בשרת שמחזיר את ה-UserProgress לפי שפה
          const data = await API_CALL(`/users/progress?lang=${lang}`);
          set({ progress: data });
        } catch (error) {
          console.error("Failed to fetch progress", error);
        }
      },
      
      // עדכון ה-Sandbox מקומית אחרי משימה (כדי לא לשלוף הכל מהשרת שוב)
      updateProgressLocally: (newProgress) => {
          set({ progress: newProgress });
      }
    }),
    {
      name: 'learning-context', // השם של המפתח ב-LocalStorage
      partialize: (state) => ({ language: state.language }), // נשמור רק את השפה ב-Storage
    }
  )
);

export default useLearningStore;