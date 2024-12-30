import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import DashboardPage from "./Pages/DashboardPage";
import ProjectsPage from "./Pages/ProjectsPage";
import TasksPage from "./Pages/TasksPage";
import SettingsPage from "./Pages/SettingsPage";
import ProfilePage from "./Pages/ProfilePage";
import CanvasPage from "./Pages/CanvasPage";
import ScriptsPage from "./Pages/ScriptsPage";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/canvas" element={<CanvasPage />} />
            <Route path="/scripts" element={<ScriptsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
