import React from "react";
import { FaRobot, FaComments, FaGraduationCap, FaMapMarkedAlt, FaRobot as FaChatbot } from "react-icons/fa";

const features = [
  {
    title: "AI-Powered Interview",
    description: "Prepare with AI-generated interview questions and get real-time feedback.",
    href: "https://interviewmateai.onrender.com/",
    icon: <FaRobot className="text-4xl text-blue-500 mb-4" />,
  },
  {
    title: "Chat with Experts",
    description: "Connect with industry professionals for guidance and mentoring.",
    href:"/mentors",
    icon: <FaComments className="text-4xl text-purple-500 mb-4" />,
  },
  {
    title: "Get Coursera Course Recommendations",
    description: "Get course recommendations based on topic, difficulty level to level up your knowledge and gain valuable certificates",
     href:"/recommender",
    icon: <FaGraduationCap className="text-4xl text-green-500 mb-4" />,
  },
  {
    title: "Personalized Roadmap",
    description: "Create a tailored learning and career roadmap just for you.",
     href:"/",
    icon: <FaMapMarkedAlt className="text-4xl text-yellow-500 mb-4" />,
  },
  {
    title: "Smart Chatbot",
    description: "Get instant answers to your queries with an intelligent chatbot.",
     href:"/",
    icon: <FaChatbot className="text-4xl text-pink-500 mb-4" />,
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
          Explore Our Features
        </h2>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <a
              href={feature.href}
              key={idx}
              className="group cursor-pointer p-8 bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:bg-gray-700 transition-all duration-500 flex flex-col items-center text-center"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>

              {/* Animated underline */}
              <span className="block h-[3px] w-0 bg-gradient-to-r from-blue-400 to-purple-400 mt-6 group-hover:w-16 mx-auto transition-all duration-300 rounded-full"></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
