import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
    description: "",
    social_url: "",
    profile_picture: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "profile_picture") {
      setFormData({ ...formData, profile_picture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignup) {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) data.append(key, value);
        });
        await signup(data);
         navigate("/");
      } else {
        await login(formData.email, formData.password);
         navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
       
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Student">Student</option>
                  <option value="Mentor">Mentor</option>
                </select>

                <input
                  type="text"
                  name="social_url"
                  placeholder="Social URL (optional)"
                  value={formData.social_url}
                  onChange={handleChange}
                  className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="file"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full text-gray-600"
                />
              </div>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {isSignup && (
            <textarea
              name="description"
              placeholder="Tell us about yourself..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-5 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-32"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 cursor-pointer font-medium hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
