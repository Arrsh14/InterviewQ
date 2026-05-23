import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";  // change this to:
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import InterviewPage from "./pages/InterviewPage";
import ResultsPage from "./pages/ResultsPage";
import Features from "./pages/Features";
import Research from "./pages/Research";
import Docs from "./pages/Docs";
import SettingsPage from "./pages/SettingsPage";
import PreInterviewSetup from "./pages/PreInterviewSetup";
import ProgressPage from './pages/ProgressPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />  /
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/features" element={<Features />} />
        <Route path="/research" element={<Research />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pre-interview" element={<PreInterviewSetup />} />
        <Route path="/progress" element={<ProgressPage />} />

      </Routes>
    </Router>
  );
}