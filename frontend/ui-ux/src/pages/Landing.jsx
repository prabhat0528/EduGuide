import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
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
    { sender: "bot", text: "Hi 👋 Ask me anything about EduGuide!" }
  ]);
  const [input, setInput] = useState("");
  const [typingText, setTypingText] = useState("");

  const chatRef = useRef(null);

  const fetchQuote = () => {
    fetch("https://eduguide-genai.onrender.com/get-motivation")
      .then(res => res.json())
      .then(data => data?.quote && setQuote(data.quote))
      .catch(() => setQuote("Stay motivated and keep growing!"));
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, typingText]);

  const typeWriter = (text) => {
    let i = 0;
    setTypingText("");

    const interval = setInterval(() => {
      setTypingText(prev => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setMessages(prev => [...prev, { sender: "bot", text }]);
        setTypingText("");
      }
    }, 20);
  };

  const cleanText = (text) => text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("https://eduguide-rag.onrender.com/get-information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      const answer = cleanText(data?.answer || "I couldn't find an answer.");

      typeWriter(answer);

    } catch {
      typeWriter("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-[#0A0F1F] text-white overflow-hidden">

        {/* HERO */}
        <section className="relative z-20 flex flex-col items-center text-center px-6 mt-20">

          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              className="text-blue-300 italic mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {quote}
            </motion.p>
          </AnimatePresence>

          <motion.h1 className="text-5xl md:text-7xl font-extrabold">
            Discover Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {" "}Perfect Career Path
            </span>
          </motion.h1>

          <p className="text-gray-300 mt-5 max-w-xl">
            AI-powered career guidance, courses & personalized roadmaps.
          </p>

          <button
            onClick={() => navigate(user ? "/features" : "/auth")}
            className="mt-10 px-10 py-4 rounded-full bg-gradient-to-r from-green-400 to-blue-600 shadow-lg hover:scale-105 transition"
          >
            {user ? "Explore our Features →" : "Start Your Journey →"}
          </button>
        </section>

        {/* CHAT BOT BUTTON */}
        <div onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 cursor-pointer">
          <MessageCircle className="w-14 h-14 text-white bg-blue-600 p-3 rounded-full shadow-lg drop-shadow-none" />
        </div>

        {/* CHAT WINDOW */}
        {chatOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-[#0A0F1F] border border-white/10 rounded-2xl flex flex-col z-50"
          >
            <div className="flex justify-between p-3 border-b border-white/10">
              <span>EduGuide Assistant</span>
              <X onClick={() => setChatOpen(false)} className="cursor-pointer" />
            </div>

            <div ref={chatRef} className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
              {messages.map((msg, i) => (
                <div key={i}
                  className={`p-2 rounded-lg max-w-[85%] ${msg.sender === "user"
                    ? "bg-blue-600 ml-auto"
                    : "bg-white/10"}`}>
                  {msg.text}
                </div>
              ))}
              {typingText && (
                <div className="p-2 rounded-lg bg-white/10 max-w-[85%]">
                  {typingText}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-white/10 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask something..."
                className="flex-1 bg-black/40 px-3 py-2 rounded-lg outline-none"
              />
              <button onClick={sendMessage}
                className="bg-blue-600 px-4 py-2 rounded-lg">
                Send
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
