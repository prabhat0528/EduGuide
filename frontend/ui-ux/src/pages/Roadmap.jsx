import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Calendar, Rocket } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/Authcontext";

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
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight capitalize">
          {title}
        </h1>
      </div>

      {Object.entries(data).map(([month, weeks], i) => (
        <div key={i}>
          <div className="flex items-center gap-3 mb-6 sticky top-20 bg-slate-950/80 backdrop-blur-sm py-2 z-10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
              {month}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 ml-4 border-l-2 border-slate-800 pl-8 pb-4">
            {Object.entries(weeks).map(([week, task], j) => (
              <div
                key={j}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5"
              >
                <div className="text-xs font-black text-blue-500 mb-2 uppercase tracking-widest">
                  {week}
                </div>
                <p className="text-slate-300 leading-relaxed">{task}</p>
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
  const { user, checkAuth } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const contentRef = useRef(null);
  const isSyncingRef = useRef(false);

  /*  Reset sync when user changes  */
  useEffect(() => {
    isSyncingRef.current = false;
  }, [user?._id]);

  /*  Backend  UI  */
  useEffect(() => {
    if (!user || !Array.isArray(user.roadmap)) return;
    if (isSyncingRef.current) return;

    const formatted = user.roadmap
      .map((r) => ({
        id: r._id,
        title: r.topic,
        content:
          typeof r.content === "string" ? JSON.parse(r.content) : r.content,
      }))
      .reverse();

    setRoadmaps(formatted);
    setActiveIndex((prev) =>
      prev === null || prev >= formatted.length ? 0 : prev
    );
  }, [user]);

  /* Scroll top when roadmap changes */
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [activeIndex]);

  /* Generate Roadmap */
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
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const generatedContent = data.roadmap;

      if (user) {
        isSyncingRef.current = true;

        const saveRes = await axios.post(
          "https://eduguide-backend-z81h.onrender.com/api/auth/save-roadmap",
          { topic: prompt, content: generatedContent },
          { withCredentials: true }
        );

        setRoadmaps((prev) => [
          {
            id: saveRes.data.roadmap._id,
            title: prompt,
            content: generatedContent,
          },
          ...prev,
        ]);

        setActiveIndex(0);

        await checkAuth();

        isSyncingRef.current = false;
      } else {
        setRoadmaps((prev) => [{ title: prompt, content: generatedContent }, ...prev]);
        setActiveIndex(0);
      }

      setPrompt("");
    } catch (err) {
      setError(err.message || "Something went wrong");
      isSyncingRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-200 pt-16">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 p-4">
        <h1 className="text-xl font-bold text-blue-400 mb-8 px-2">Your Pathways</h1>
        <div className="space-y-2 overflow-y-auto">
          {roadmaps.map((r, i) => (
            <button
              key={r.id || i}
              onClick={() => setActiveIndex(i)}
              className={`w-full text-left p-4 rounded-xl transition ${
                activeIndex === i
                  ? "bg-blue-600/10 border border-blue-500/40 text-blue-400"
                  : "hover:bg-slate-800/50 text-slate-400"
              }`}
            >
              <p className="line-clamp-2 text-sm uppercase">{r.title}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col ml-72">
        <div ref={contentRef} className="flex-1 overflow-y-auto p-10">
          {error && <div className="text-red-400 mb-4">{error}</div>}

          {roadmaps[activeIndex] && (
            <RoadmapCard
              roadmapData={roadmaps[activeIndex].content}
              title={roadmaps[activeIndex].title}
            />
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-slate-900">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
              placeholder="e.g. Master React in 2 months"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
            />
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-xl"
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
