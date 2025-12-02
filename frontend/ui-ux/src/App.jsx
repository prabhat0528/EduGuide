import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import CourseRecommender from "./pages/CourseraRecommender";
import About from "./pages/About";
import Navbar from "./pages/Navbar";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import MentorList from "./pages/MentorList";
import MentorProfile from "./pages/MentorProfile";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path = "/recommender" element = {<CourseRecommender/>}/>
        <Route path = "/about" element = {<About/>}/>
        <Route path = "/auth" element={<AuthPage/>}/>
        <Route path = "/profile" element = {<ProfilePage/>}/>
        <Route path = "/edit-profile" element={<EditProfile/>}/>
        <Route path="/mentors" element={<MentorList />} />
        <Route path="/mentor/:id" element={<MentorProfile />} />


      </Routes>
    </Router>
  );
}

export default App;
