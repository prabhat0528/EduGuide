import React from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

export default function About() {
  const { user } = useAuth();
  const navigate = useNavigate(); 

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0f172a] to-black text-white">

      {/* Header Section */}
      <div className="text-center py-20 bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-blue-600/40 backdrop-blur-xl shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] border-b border-white/10">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-transparent bg-clip-text drop-shadow-md">
          About Us
        </h1>
        <p className="text-lg mt-4 max-w-3xl mx-auto text-gray-300">
          Empowering students with real mentorship and helping working professionals
          contribute to shaping future innovators.
        </p>
      </div>

      {/* Team Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Meet Our Team
        </h2>

        <div className="grid gap-14 grid-cols-1 md:grid-cols-3">

          {/* Member Cards */}
          {[
            {
              img: "https://res.cloudinary.com/duv8kkdeb/image/upload/v1765289380/x5qgbj0qzcwsesgtocjg.png",
              name: "Prabhat Rai",
              role: "Project Manager",
              desc: "A B.tech CSE 3rd year fellow with expertise in supervised machine learning , GenAi , full stack development. Oversaw project planning, task distribution, timelines, and overall coordination of the EduGuide development process."
            },
            {
              img: "https://res.cloudinary.com/duv8kkdeb/image/upload/v1765289279/twaikzicihkzdsqlv4nm.jpg",
              name: "Yuvraj Singh",
              role: "Quality Assurance Lead",
              desc: "A B.tech CSE 3rd year fellow having expertise in full stack development in MERN stack. Responsilbe for handling tech quality and user experrience of EduGuide."
            },
            {
              img: "https://res.cloudinary.com/duv8kkdeb/image/upload/v1765341325/p3fmwwaetpxzkdflvt5g.jpg",
              name: "Sreyansh Tarwey",
              role: "Tech & Platform Engineer",
              desc: "A B.tech CSE 3rd year fellow having expertise in full stack development in MERN stack.Sreyansh builds, and optimizes the technical foundation of our platform."
            },
          ].map((person, i) => (
            <div
              key={i}
              className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.6)]
              hover:shadow-[0_0_70px_-10px_rgba(56,189,248,0.5)] transition duration-300 backdrop-blur-xl"
            >
              <img
                src={person.img}
                alt={person.name}
                className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-white/20 shadow-lg"
              />
              <h3 className="text-2xl font-semibold mt-5 text-center text-blue-300">
                {person.name}
              </h3>
              <p className="text-sm text-purple-300 text-center mb-3">{person.role}</p>
              <p className="text-gray-300 text-center">{person.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Student CTA */}
      {!user && (
        <section className="py-24 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-5xl font-bold text-blue-300 drop-shadow-md mb-6">
              A Message to Students
            </h2>

            <p className="text-lg leading-relaxed text-gray-300 max-w-3xl mx-auto">
              Your career journey deserves guidance, clarity, and real-world insights.  
              Leverage this platform to learn from experienced professionals and unlock opportunities
              that accelerate your growth.
            </p>

            <button onClick={()=>navigate("/auth")} className="mt-8 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-[0_0_30px_#6366f1] transition font-semibold">
              Start Your Career Journey
            </button>
          </div>
        </section>
      )}

      {/* Mentor CTA */}
      {!user && (
        <section className="py-24 bg-white/5 backdrop-blur-xl border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 drop-shadow-md mb-6">
              Invitation to Professionals
            </h2>

            <p className="text-lg leading-relaxed text-gray-300 max-w-3xl mx-auto">
              Share your knowledge. Guide aspiring learners.  
              Join us as a mentor and help shape the future — at no cost to the students.
              Your contribution can be the turning point in someone's career.
            </p>

            <button onClick={()=>navigate("/auth")}className="mt-8 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg hover:shadow-[0_0_30px_#ec4899] transition font-semibold">
              Register as a Mentor
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
