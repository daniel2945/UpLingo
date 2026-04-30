import React, { useState, useEffect } from "react";
import API_CALL from "../api/API_CALL";
import { Trash2, Globe, Database } from "lucide-react";
import toast from "react-hot-toast";

const MissionsManager = ({ globalLang, setGlobalLang }) => {
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
  ];

  const [missions, setMissions] = useState([]);

  useEffect(() => {
    fetchMissions();
  }, [globalLang]);

  const fetchMissions = async () => {
    try {
      const data = await API_CALL(`/admin/missions?lang=${globalLang}`);
      setMissions(data);
    } catch (error) {
      console.error("Failed to load missions", error);
    }
  };

  const handleDelete = async (id, title) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="font-bold text-slate-800">
            Are you sure you want to delete: "{title}"?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await API_CALL(`/admin/missions/${id}`, "DELETE");
                  setMissions(missions.filter((m) => m._id !== id));
                  toast.success("Mission deleted successfully!");
                } catch (error) {
                  toast.error("Error deleting mission");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors w-full"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm transition-colors w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setGlobalLang(lang.code)}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${globalLang === lang.code ? "bg-white shadow-md text-primary" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Globe size={18} /> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Database className="text-primary" size={36} /> Manage Missions
        </h1>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {missions.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            No missions found for {globalLang.toUpperCase()}.
          </p>
        ) : (
          <div className="space-y-4">
            {missions.map((mission) => (
              <div
                key={mission._id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-primary text-white font-black text-xl h-12 w-12 flex items-center justify-center rounded-xl shadow-sm">
                    {mission.missionOrder}
                  </span>
                  <div>
                    <span className="font-bold text-xl text-slate-800 block">
                      {mission.title}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      Rule:{" "}
                      {mission.grammarRuleRef
                        ? mission.grammarRuleRef.ruleName
                        : "None"}{" "}
                      | Cards: {mission.cards?.length || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(mission._id, mission.title)}
                  className="p-3 bg-white text-red-400 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all shadow-sm"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionsManager;
