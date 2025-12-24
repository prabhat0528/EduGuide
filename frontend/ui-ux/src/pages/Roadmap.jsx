import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle, Calendar } from "lucide-react";

/* -------------------- ROADMAP CARD -------------------- */
const RoadmapCard = ({ roadmapData }) => {
 
  const data = roadmapData.roadmap || roadmapData;

  if (!data || typeof data !== 'object') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(data).map(([month, weeks], i) => (
        <div key={i} className="relative">
          {/* Month Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Calendar className="text-blue-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {month}
            </h2>
          </div>

          {/* Weeks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-2 border-l-2 border-slate-800 pl-6">
            {Object.entries(weeks).map(([week, task], j) => (
              <div
                key={j}
                className="group bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors rounded-xl p-4 shadow-sm"
              >
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                  {week}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {task}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------- MAIN COMPONENT -------------------- */
const Roadmap = () => {
  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [activeIndex]);

  const generateRoadmap = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        "https://eduguide-genai.onrender.com/generate-roadmap",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate roadmap");
      }

      const newEntry = {
        title: prompt,
        content: data.roadmap, 
      };

      setRoadmaps((prev) => [newEntry, ...prev]);
      setActiveIndex(0);
      setPrompt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI Mentor
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
            Recent Roadmaps
          </p>
          {roadmaps.map((r, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-full text-left p-3 rounded-xl text-sm transition-all duration-200 truncate ${
                activeIndex === idx
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8 md:p-12">
          {error && (
            <div className="max-w-2xl mx-auto mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {activeIndex === null && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                <Send className="text-blue-500" size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-white">Ready to start?</h2>
              <p className="text-slate-500 max-w-sm">
                Enter a goal like "Learn Backend Development" to get a customized 3-month plan.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="text-blue-400 font-medium animate-pulse">Building your curriculum...</p>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2 italic">
                      "{roadmaps[activeIndex]?.title}"
                    </h1>
                    <p className="text-slate-500">Structured 12-week learning path</p>
                  </div>
                  <RoadmapCard roadmapData={roadmaps[activeIndex]?.content} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="What do you want to learn?"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl pl-6 pr-16 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600 shadow-2xl"
            />
            <button
              onClick={generateRoadmap}
              disabled={loading || !prompt.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;