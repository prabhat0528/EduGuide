import { useState } from "react";
import { Send, BookOpen, Menu, X } from "lucide-react";

const Roadmap = () => {
  const [prompt, setPrompt] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const generateRoadmap = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success) {
        const newRoadmap = {
          title: prompt,
          content: data.roadmap,
        };
        setRoadmaps([newRoadmap, ...roadmaps]);
        setActiveIndex(0);
        setPrompt("");
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-slate-100">
      
     

      <div className="flex pt-16 h-full">
        
        {/* ---------- Sidebar ---------- */}
        <aside
          className={`fixed md:static z-40 top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-slate-900/90 backdrop-blur border-r border-slate-700 p-4 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold mb-4 text-blue-400">
            <BookOpen size={16} />
            Previous Roadmaps
          </h2>

          <div className="space-y-2 overflow-y-auto h-full pr-1">
            {roadmaps.length === 0 && (
              <p className="text-xs text-slate-400">
                No roadmaps generated yet
              </p>
            )}

            {roadmaps.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all
                ${
                  activeIndex === index
                    ? "bg-blue-600/30 text-blue-300 shadow-inner"
                    : "hover:bg-slate-800"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </aside>

        {/* ---------- Main Content ---------- */}
        <main className="flex-1 flex flex-col">
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeIndex === null ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Ask something like “Give me a roadmap for data science in 3 months”
              </div>
            ) : (
              <div className="bg-slate-900/70 border border-slate-700 rounded-xl shadow-2xl p-6">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                  {roadmaps[activeIndex].content}
                </pre>
              </div>
            )}
          </div>

          {/* ---------- Input Box ---------- */}
          <div className="border-t border-slate-700 bg-slate-900/80 backdrop-blur p-4">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <input
                type="text"
                placeholder="Give me a roadmap for data science in 3 months"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateRoadmap()}
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={generateRoadmap}
                disabled={loading}
                className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition shadow-lg disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Roadmap;
