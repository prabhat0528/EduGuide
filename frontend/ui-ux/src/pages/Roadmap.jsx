import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, AlertCircle, Calendar } from "lucide-react";

/* -------------------- ROADMAP CARD -------------------- */
const RoadmapCard = ({ roadmapData }) => {
  const data = roadmapData?.roadmap || roadmapData;
  if (!data || typeof data !== "object") return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(data).map(([month, weeks], i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Calendar className="text-blue-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">{month}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 ml-2 border-l-2 border-slate-800 pl-6">
            {Object.entries(weeks).map(([week, task], j) => (
              <div
                key={j}
                className="bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition rounded-xl p-4"
              >
                <div className="text-xs font-bold text-blue-500 mb-1">{week}</div>
                <p className="text-slate-300 text-sm">{task}</p>
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
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeIndex]);

  const generateRoadmap = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");

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
    <div className="h-screen flex bg-slate-950 text-slate-200">

      {/* SIDEBAR */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/30 p-4">
        <h1 className="text-xl font-bold text-blue-400 mb-4">AI Mentor</h1>

        {roadmaps.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-full text-left p-3 rounded-xl mb-2 ${
              activeIndex === i ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            {r.title}
          </button>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-20">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-10">

          {error && (
            <div className="mb-6 bg-red-500/10 text-red-400 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {activeIndex === null ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
              <p className="text-slate-500">
                Example: <b>Learn Full Stack in 6 months</b>
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : (
            <RoadmapCard roadmapData={roadmaps[activeIndex].content} />
          )}
        </div>

        {/* INPUT */}
        <div className="p-6 bg-slate-950">
          <div className="relative max-w-3xl mx-auto">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="What do you want to learn? (e.g. Learn AI in 6 months)"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl pl-6 pr-16 py-4"
            />
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 p-3 rounded-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
