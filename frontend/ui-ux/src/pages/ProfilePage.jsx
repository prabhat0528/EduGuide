"use client";
import React from "react";
import { useAuth } from "../context/Authcontext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-2xl">
        Please login to view your profile.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 px-6 bg-[#0A0F1F] text-white"
    >
      <div className="max-w-3xl mx-auto bg-[#111827] p-8 rounded-2xl shadow-xl border border-white/10">

        <div className="flex flex-col items-center">
          <img
            src={user.profile_picture}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
          />

          <h1 className="mt-4 text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        <div className="mt-8 space-y-4">
          <Info label="Role" value={user.role} />
          <Info label="Description" value={user.description} />
          <Info label="Social URL" value={user.social_url || "Not provided"} />
        </div>

        {/* Buttons */}
        <div className="mt-10 flex gap-4 justify-center">
          <Link
            to="/edit-profile"
            className="px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition"
          >
            Edit Profile
          </Link>

          <Link
            to="/"
            className="px-6 py-3 bg-gray-600 rounded-full hover:bg-gray-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border border-white/10">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg">{value}</p>
    </div>
  );
}
