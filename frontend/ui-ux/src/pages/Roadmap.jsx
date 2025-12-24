import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle, Calendar, Menu, X, Rocket } from "lucide-react";

/* -------------------- ROADMAP CARD -------------------- */
const RoadmapCard = ({ roadmapData, title }) => {
  const data = roadmapData?.roadmap || roadmapData;
  if (!data || typeof data !== "object") return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Rocket size={14} /> Custom Learning Path
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          We've broken down your goal into manageable weekly milestones. Stick to the plan and track your progress.
        </p>
      </div>

      {Object.entries(data).map(([month, weeks], i) => (
        <div key={i} className="relative">
          <div className="flex items-center gap-3 mb-6 sticky top-20 bg-slate-950/80 backdrop-blur-sm py-2 z-10">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
              <Calendar className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">{month}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 ml-4 border-l-2 border-slate-800 pl-8 pb-4">
            {Object.entries(weeks).map(([week, task], j) => (
              <div
                key={j}
                className="group bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-300 rounded-2xl p-5 shadow-sm"
              >
                <div className="text-xs font-black text-blue-500 mb-2 uppercase tracking-widest group-hover:text-blue-400">
                  {week}
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">{task}</p>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeIndex]);

  const generateRoadmap = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setIsSidebarOpen(false);

    try {
      const res = await fetch("https://eduguide-genai.onrender.com/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setRoadmaps((prev) => [{ title: prompt, content: data.roadmap }, ...prev]);
      setActiveIndex(0);
      setPrompt("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 pt-16"> 
      
      {/* MOBILE HAMBURGER BUTTON */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-24 right-6 z-50 bg-blue-600 p-4 rounded-full shadow-2xl text-white"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR  */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 p-4 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 pt-20 lg:pt-4
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <h1 className="text-xl font-bold text-blue-400">Your Pathways</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
          {roadmaps.length === 0 && (
            <p className="text-sm text-slate-600 px-2 italic text-center py-10">No recent paths yet</p>
          )}
          {roadmaps.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-4 rounded-xl transition-all ${
                activeIndex === i 
                ? "bg-blue-600/10 border border-blue-500/40 text-blue-400 font-semibold" 
                : "hover:bg-slate-800/50 text-slate-400 border border-transparent"
              }`}
            >
              <p className="line-clamp-2 text-sm uppercase tracking-tight">{r.title}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-12">
          {error && (
            <div className="max-w-3xl mx-auto mb-6 bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {activeIndex === null && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-700">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Rocket className="text-blue-500" size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white">Start Your Learning Journey</h2>
              <p className="text-slate-500 max-w-sm">
                Enter a topic and duration below to generate a custom-tailored learning roadmap.
              </p>
              <p className="mt-4 text-xs font-mono text-slate-700">E.G. "MASTER DATA SCIENCE IN 3 MONTHS"</p>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-blue-400 font-medium animate-pulse">Architecting your roadmap...</p>
            </div>
          ) : (
            <RoadmapCard 
                roadmapData={roadmaps[activeIndex].content} 
                title={roadmaps[activeIndex].title} 
            />
          )}
        </div>

        {/* INPUT SECTION */}
        <div className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="relative max-w-3xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="What do you want to learn? (e.g. Learn AI in 6 months)"
              className="relative w-full bg-slate-900 border border-slate-700 text-white rounded-2xl pl-6 pr-16 py-5 focus:border-blue-500 focus:ring-0 transition-all outline-none"
            />
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 p-3 rounded-xl transition-colors shadow-lg shadow-blue-900/40"
            >
              {loading ? <Loader2 className="animate-spin text-white" /> : <Send className="text-white" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;