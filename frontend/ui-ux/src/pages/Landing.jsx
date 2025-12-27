import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./Navbar";
import useLenis from "../hooks/Lenis";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { MessageCircle, X } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  useLenis();
  const { user } = useAuth();

  const [quote, setQuote] = useState(
    "Failure will never overtake me if my definition to succeed is strong enough"
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi  Ask me anything about EduGuide!" }
  ]);
  const [input, setInput] = useState("");

  //  Chatbot upgrades
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchQuote = () => {
    fetch("https://eduguide-genai.onrender.com/get-motivation")
      .then((res) => res.json())
      .then((data) => {
        if (data.quote) setQuote(data.quote);
      })
      .catch(() => {
        setQuote("Stay motivated and keep growing!");
      });
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 300000);
    return () => clearInterval(interval);
  }, []);

  //  Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setIsTyping(true);
    setTypingText("");

    try {
      const res = await fetch("https://eduguide-rag.onrender.com/get-information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.text }),
      });

      const data = await res.json();
      const answer = data.answer || "I couldn't find that information.";

      let i = 0;
      const interval = setInterval(() => {
        setTypingText((prev) => prev + answer[i]);
        i++;

        if (i >= answer.length) {
          clearInterval(interval);
          setMessages((prev) => [...prev, { sender: "bot", text: answer }]);
          setTypingText("");
          setIsTyping(false);
        }
      }, 25);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong. Try again." }]);
      setIsTyping(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="relative min-h-screen overflow-hidden bg-[#0A0F1F] text-white">

        {/* BACKGROUND ORBS */}
        <motion.div
          className="absolute top-[-150px] left-[-100px] w-[450px] h-[450px] bg-blue-500/30 rounded-full blur-[200px]"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
        />
        <motion.div
          className="absolute bottom-[-150px] right-[-120px] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[200px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 12 }}
        />

        <div className="absolute inset-0 bg-[url('https://i.ibb.co/7S8T3Fc/waves.png')] opacity-20 bg-cover bg-center" />

        {/* HERO */}
        <section className="relative z-20 flex flex-col items-center text-center px-6 mt-20">

          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              className="text-blue-300 text-lg italic max-w-2xl mb-6 px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              {quote}
            </motion.p>
          </AnimatePresence>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold leading-tight max-w-4xl"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Discover Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              {" "}Perfect Career Path
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-300 mt-5 text-lg max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            EduGuide is your one-stop personalized career & education advisor —
            helping you find your strengths, choose the right career, explore
            courses, and get step-by-step growth roadmaps.
          </motion.p>

          {user ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => navigate("/features")}
              className="mt-10 px-10 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-green-400 to-blue-600 shadow-xl hover:scale-105 transition"
            >
              Explore our Features →
            </motion.button>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => navigate("/auth")}
              className="mt-10 px-10 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-teal-400 to-blue-600 shadow-xl hover:scale-105 transition"
            >
              Start Your Journey →
            </motion.button>
          )}
        </section>

        {/* FEATURES */}
        <section className="relative z-20 px-8 md:px-20 mt-32">
          <h2 className="text-center text-4xl font-bold mb-12">
            What Makes <span className="text-blue-300">EduGuide</span> Special?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <Card title="AI-Based Career Guidance" desc="Get personalized career paths based on your skills and interests." />
            <Card title="Smart Course Recommendations" desc="Curated courses to build skills you need." />
            <Card title="Step-by-Step Roadmaps" desc="Clear learning paths tailored for your future." />
          </div>
        </section>

        <footer className="mt-32 py-10 text-center text-gray-400 border-t border-white/10">
          © {new Date().getFullYear()} EduGuide — Personalized Career & Education Advisor
        </footer>

        {/* FLOATING CHATBOT */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="fixed bottom-6 right-6 z-50 cursor-pointer"
          onClick={() => setChatOpen(true)}
        >
          <MessageCircle className="w-14 h-14 text-white bg-blue-600 p-3 rounded-full shadow-xl" />
        </motion.div>

        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-[#0A0F1F] rounded-2xl shadow-2xl z-50 flex flex-col border border-white/10"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="font-semibold text-white">EduGuide Assistant</span>
              <X className="cursor-pointer" onClick={() => setChatOpen(false)} />
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-lg max-w-[85%] ${
                    msg.sender === "user" ? "bg-blue-600 ml-auto" : "bg-white/10"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {isTyping && (
                <div className="p-2 rounded-lg max-w-[85%] bg-white/10">
                  {typingText}
                  <span className="animate-pulse">▍</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-2 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something..."
                className="flex-1 bg-black/40 px-3 py-2 rounded-lg text-sm outline-none"
              />
              <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

function Card({ title, desc }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg">
      <h3 className="text-xl font-bold text-blue-200">{title}</h3>
      <p className="text-gray-300 mt-3">{desc}</p>
    </motion.div>
  );
}
