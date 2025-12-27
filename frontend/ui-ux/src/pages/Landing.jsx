import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react"; 
import Navbar from "./Navbar";
import useLenis from "../hooks/Lenis";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { MessageCircle, X, Send } from "lucide-react"; 

export default function Landing() {
  const navigate = useNavigate();
  useLenis();
  const { user } = useAuth();
  
  // Refs for auto-scrolling
  const chatEndRef = useRef(null);

  const [quote, setQuote] = useState("Failure will never overtake me...");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about EduGuide!", isTyping: false }
  ]);
  const [input, setInput] = useState("");
  const [isBotLoading, setIsBotLoading] = useState(false);

  // Auto-scroll logic
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchQuote = () => {
    fetch("https://eduguide-genai.onrender.com/get-motivation")
      .then((res) => res.json())
      .then((data) => { if (data.quote) setQuote(data.quote); })
      .catch(() => setQuote("Stay motivated and keep growing!"));
  };

  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 300000);
    return () => clearInterval(interval);
  }, []);

  
  const sendMessage = async () => {
    if (!input.trim() || isBotLoading) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsBotLoading(true);

    try {
      const response = await fetch("https://eduguide-rag.onrender.com/get-information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: currentInput }),
      });

      const data = await response.json();
      
      // Cleaning \n and other formatting artifacts
      const cleanText = data.answer.replace(/\\n/g, ' ').replace(/\n/g, ' ');

      const botMsg = { 
        sender: "bot", 
        text: cleanText, 
        isTyping: true 
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setIsBotLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-[#0A0F1F] text-white">
       

        {/* FLOATING CHATBOT ICON */}
        {!chatOpen && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            onClick={() => setChatOpen(true)}
          >
            <div className="relative">
              <MessageCircle className="w-14 h-14 text-white bg-blue-600 p-3 rounded-full shadow-xl" />
              <span className="absolute -top-10 right-0 bg-black text-white text-[10px] px-3 py-1 rounded-md whitespace-nowrap">
                Ask me about this app
              </span>
            </div>
          </motion.div>
        )}

        {/* CHAT WINDOW */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-[#0D1425] rounded-2xl shadow-2xl z-50 flex flex-col border border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-blue-600 rounded-t-2xl">
                <span className="font-bold text-white">EduGuide AI Assistant</span>
                <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setChatOpen(false)} />
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                      msg.sender === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/10 text-gray-200 rounded-tl-none"
                    }`}>
                      {msg.isTyping ? (
                        <Typewriter text={msg.text} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {isBotLoading && (
                    <div className="bg-white/10 text-gray-400 p-3 rounded-2xl w-12 text-center animate-pulse">...</div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-white/10 flex gap-2 bg-[#0A0F1F] rounded-b-2xl">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask something..."
                  className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                  onClick={sendMessage} 
                  disabled={isBotLoading}
                  className="bg-blue-600 p-2 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Writing Effect Component
function Typewriter({ text, speed = 20 }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}

function Card({ title, desc }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg">
      <h3 className="text-xl font-bold text-blue-200">{title}</h3>
      <p className="text-gray-300 mt-3">{desc}</p>
    </motion.div>
  );
}