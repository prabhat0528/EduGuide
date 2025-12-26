import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    description: user?.description || "",
    social_url: user?.social_url || "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewPic, setPreviewPic] = useState(user?.profile_picture);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // keep formData in sync if user loaded later
  useEffect(() => {
    setFormData({
      name: user?.name || "",
      role: user?.role || "",
      description: user?.description || "",
      social_url: user?.social_url || "",
    });
    setPreviewPic(user?.profile_picture);
  }, [user]);

  useEffect(() => {
    // cleanup object URL when component unmounts or preview changes
    return () => {
      if (previewPic && previewPic.startsWith("blob:")) {
        URL.revokeObjectURL(previewPic);
      }
    };
  }, [previewPic]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setProfilePic(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewPic(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, val]) =>
        form.append(key, val || "")
      );
      if (profilePic) form.append("profile_picture", profilePic);

      const res = await fetch("https://eduguide-backend-z81h.onrender.com/api/auth/update-profile", {
        method: "PUT",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        // update auth context
        if (setUser) setUser(data.user);
        navigate("/profile");
      } else {
        setError(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen pt-28 px-6 bg-[#0A0F1F] text-white"
    >
      <div className="max-w-3xl mx-auto bg-[#111827] p-8 rounded-2xl shadow-xl border border-white/10">
        <h1 className="text-3xl font-bold text-center mb-6">Edit Profile</h1>

        {error && (
          <div className="mb-4 text-red-400 bg-red-900/30 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <img
              src={previewPic || "https://via.placeholder.com/150"}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePicChange}
              className="mt-4 text-sm"
            />
          </div>

          {/* Name */}
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          {/* Role */}
          <Input
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          />

          {/* Description */}
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          {/* Social URL */}
          <Input
            label="Social URL"
            name="social_url"
            value={formData.social_url}
            onChange={handleChange}
          />

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 rounded-full transition ${
                saving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-gray-600 rounded-full hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function Input({ label, name, value, onChange }) {
  return (
    <div>
      <p className="text-gray-300 mb-1">{label}</p>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-black/30 border border-white/10 text-white"
      />
    </div>
  );
}
