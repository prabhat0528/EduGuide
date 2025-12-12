"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import { FiMenu, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        fixed top-0 left-0 w-full z-50
        backdrop-blur-2xl bg-[#0A0F1F]/40
        border-b border-white/10
        shadow-[0_0_40px_rgba(0,0,0,0.5)]
      "
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text"
        >
          EduGuide
        </Link>

        {/* NAV LINKS (Desktop) */}
        <div className="hidden md:flex items-center gap-6">

          {/* Regular Links */}
          <NavItem label="About" path="/about" />
          <NavItem label="My Chats" path="/chats" />

          {/* Reviews --- Visible only when logged in */}
          {user && <NavItem label="Reviews" path="/reviews" />}

          {/* If user is logged in */}
          {user ? (
            <div className="flex items-center gap-4">

              {/* Review Button */}
              <Link
                to="/reviews"
                className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition"
              >
                Review
              </Link>

              <Link to="/profile">
                <img
                  src={
                    user.profile_picture ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwTjn7ADTGtefL4Im3WluJ6ersByvJf8k7-Q&s"
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
                />
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white text-2xl focus:outline-none"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-[#0A0F1F]/95 backdrop-blur-2xl p-4 flex flex-col gap-4"
        >
          <Link
            to="/about"
            className="text-gray-200 text-lg hover:text-blue-400 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>

          <Link
            to="/chats"
            className="text-gray-200 text-lg hover:text-blue-400 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            My Chats
          </Link>

          {/* Mobile Reviews */}
          {user && (
            <Link
              to="/reviews"
              className="text-gray-200 text-lg hover:text-blue-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Reviews
            </Link>
          )}

          {user ? (
            <div className="flex flex-col gap-3 items-center">

              {/* Review Button */}
              <Link
                to="/reviews"
                className="px-6 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition w-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Review
              </Link>

              <img
                src={user.profile_picture || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />

              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition w-full"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-6 py-2 rounded-full bg-blue-600 text-white text-center hover:bg-blue-700 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

/* Nav item with animated underline hover */
function NavItem({ label, path }) {
  return (
    <motion.div className="relative cursor-pointer transition">
      <Link to={path} className="relative text-gray-300 hover:text-white">
        {label}
        <motion.span
          className="absolute left-0 bottom-[-4px] h-[2px] bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </motion.div>
  );
}
