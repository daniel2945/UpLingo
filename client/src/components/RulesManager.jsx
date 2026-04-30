import React, { useState, useEffect } from "react";
import { Trash2, Globe, Filter } from "lucide-react";
import API_CALL from "../api/API_CALL";
import toast from "react-hot-toast";

const RulesManager = ({ globalLang, setGlobalLang }) => {
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
  ];

  const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];

  const [rulesList, setRulesList] = useState([]);
  const [newRule, setNewRule] = useState({
    ruleName: "",
    level: "A1",
    adminNotes: "",
    aiInstruction: "",
  });

  // State חדש לסינון
  const [filterLevel, setFilterLevel] = useState("All");

  useEffect(() => {
    fetchRules();
  }, [globalLang]);

  const fetchRules = async () => {
    try {
      const data = await API_CALL(`/admin/rules?lang=${globalLang}`);
      setRulesList(data);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newRule, language: globalLang };
      await API_CALL("/admin/rules", "POST", payload);
      setNewRule({
        ruleName: "",
        level: newRule.level,
        adminNotes: "",
        aiInstruction: "",
      }); // משאיר את הרמה שבחר
      fetchRules();
      toast.success("Rule added successfully!");
    } catch (err) {
      toast.error("Failed to add rule");
    }
  };

  const handleDeleteRule = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-1">
          <p className="font-bold text-slate-800">Delete this grammar rule?</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await API_CALL(`/admin/rules/${id}`, "DELETE");
                  fetchRules();
                  toast.success("Rule deleted successfully!");
                } catch (err) {
                  toast.error("Failed to delete rule");
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

  // סינון חוקי הדקדוק
  const filteredRulesList = rulesList.filter(
    (rule) => filterLevel === "All" || rule.level === filterLevel,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* בחירת שפה */}
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setGlobalLang(lang.code)}
              className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                globalLang === lang.code
                  ? "bg-white shadow-md text-primary"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Globe size={18} /> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Grammar Rules
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Defining rules for:{" "}
          <span className="font-bold text-slate-700 underline">
            {globalLang.toUpperCase()}
          </span>
        </p>
      </div>

      {/* טופס הוספה */}
      <form
        onSubmit={handleAddRule}
        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Rule Name
            </label>
            <input
              required
              type="text"
              value={newRule.ruleName}
              onChange={(e) =>
                setNewRule({ ...newRule, ruleName: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none"
              placeholder={`e.g. Present Tense (${globalLang})`}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Level
            </label>
            <select
              value={newRule.level}
              onChange={(e) =>
                setNewRule({ ...newRule, level: e.target.value })
              }
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none min-w-[120px]"
            >
              {LEVELS.filter((l) => l !== "All").map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Admin Notes (Optional)
          </label>
          <input
            type="text"
            value={newRule.adminNotes}
            onChange={(e) =>
              setNewRule({ ...newRule, adminNotes: e.target.value })
            }
            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none"
            placeholder="Internal notes..."
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            AI Prompt Instruction
          </label>
          <textarea
            required
            value={newRule.aiInstruction}
            onChange={(e) =>
              setNewRule({ ...newRule, aiInstruction: e.target.value })
            }
            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary outline-none h-32 resize-none leading-relaxed"
            placeholder={`Tell the AI how to explain this in ${globalLang}...`}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
        >
          Save {globalLang} Rule
        </button>
      </form>

      {/* אזור הסינון לפי רמה */}
      <div className="bg-slate-100 p-2 rounded-2xl flex flex-wrap gap-2 items-center">
        <div className="text-slate-500 font-bold flex items-center gap-2 mr-4 ml-4">
          <Filter size={18} /> Filter Rules:
        </div>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-5 py-2 rounded-xl font-bold transition-all ${
              filterLevel === lvl
                ? "bg-white shadow-sm text-slate-800"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* הצגת החוקים */}
      <div className="grid gap-6">
        {filteredRulesList.length === 0 ? (
          <p className="text-center text-slate-400 py-10 font-medium">
            No grammar rules found for{" "}
            {filterLevel !== "All" ? `level ${filterLevel}` : "this language"}.
          </p>
        ) : (
          filteredRulesList.map((rule) => (
            <div
              key={rule._id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-start group"
            >
              <div className="flex-1 pr-8">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-black text-xl text-slate-800">
                    {rule.ruleName}
                  </h3>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                    {rule.level}
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                    {rule.language}
                  </span>
                </div>
                {rule.adminNotes && (
                  <p className="text-slate-500 text-sm mb-4">
                    {rule.adminNotes}
                  </p>
                )}
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 font-mono border border-slate-100">
                  {rule.aiInstruction}
                </div>
              </div>
              <button
                onClick={() => handleDeleteRule(rule._id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RulesManager;
