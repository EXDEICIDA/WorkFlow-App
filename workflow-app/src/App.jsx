import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } />
            <Route path="/canvas" element={
              <ProtectedRoute>
                <CanvasPage />
              </ProtectedRoute>
            } />
            <Route path="/scripts" element={
              <ProtectedRoute>
                <ScriptsPage />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            } />
            <Route path="/items" element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </Layout>
      </Router>
    </AuthProvider>
  );
}
export default App;
