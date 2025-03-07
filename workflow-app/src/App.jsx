import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import DashboardPage from "./Pages/DashboardPage";
import ProjectsPage from "./Pages/ProjectsPage";
import TasksPage from "./Pages/TasksPage";
import SettingsPage from "./Pages/SettingsPage";
import ProfilePage from "./Pages/ProfilePage";
import CanvasPage from "./Pages/CanvasPage";
import ScriptsPage from "./Pages/ScriptsPage";
import AuthPage from "./Pages/Auth/AuthPage";
import Layout from "./Components/Layout";
import Items from "./Pages/Items";

import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/scripts" element={<ScriptsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/items" element={<Items />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
export default App;
