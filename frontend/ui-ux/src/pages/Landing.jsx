"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import useLenis from "../hooks/Lenis";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function Landing() {
  const navigate = useNavigate();
  useLenis();
  const { user } = useAuth(); 

  const [quote, setQuote] = useState(
    "Failure will never overtake me if my definition to succeed is strong enough"
  );

  // Function to fetch quote
  const fetchQuote = () => {
    fetch("https://eduguide-genai.onrender.com/get-motivation")
      .then((res) => res.json())
      .then((data) => {
        if (data.quote) setQuote(data.quote);
      })
      .catch((err) => {
        console.error("Quote fetch error:", err);
        setQuote("Stay motivated and keep growing!");
      });
  };

  // Fetch quote on load + every 5 minutes
  useEffect(() => {
    fetchQuote();
    const interval = setInterval(fetchQuote, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

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

        {/* WAVY BACKGROUND */}
        <div className="absolute inset-0 bg-[url('https://i.ibb.co/7S8T3Fc/waves.png')] opacity-20 bg-cover bg-center" />

        {/* HERO SECTION */}
        <section className="relative z-20 flex flex-col items-center text-center px-6 mt-20">

          {/* Dynamic Quote */}
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

          {/* CONDITIONAL BUTTON */}
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

        {/* FEATURE CARDS */}
        <section className="relative z-20 px-8 md:px-20 mt-32">
          <h2 className="text-center text-4xl font-bold mb-12">
            What Makes <span className="text-blue-300">EduGuide</span> Special?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <Card
              title="AI-Based Career Guidance"
              desc="Get personalized suggestions for the best career paths based on your skills and interests."
            />
            <Card
              title="Smart Course Recommendations"
              desc="Receive curated course lists to build the skills needed to reach your goals."
            />
            <Card
              title="Step-by-Step Roadmaps"
              desc="Detailed learning paths and preparation plans tailored for your chosen career."
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-32 py-10 text-center text-gray-400 border-t border-white/10">
          © {new Date().getFullYear()} EduGuide — Personalized Career & Education Advisor
        </footer>

      </div>
    </>
  );
}

function Card({ title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg"
    >
      <h3 className="text-xl font-bold text-blue-200">{title}</h3>
      <p className="text-gray-300 mt-3">{desc}</p>
    </motion.div>
  );
}
