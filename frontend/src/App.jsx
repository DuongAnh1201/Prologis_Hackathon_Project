import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Home from '../components/Home';
import Stock from '../components/Stock';
import Tasks from '../components/Tasks';
import Team from '../components/Team';
import "./App.css";

export default function App() {
  const navigate = useNavigate();

  // Restore session on first load
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  // Persist session
  useEffect(() => {
    if (auth) localStorage.setItem("auth", JSON.stringify(auth));
    else localStorage.removeItem("auth");
  }, [auth]);

  const handleLoginSuccess = (data) => {
    const session = { username: data?.username, token: data?.token, ...data };
    setAuth(session);
    navigate("/home", { replace: true });
  };

  const handleLogout = () => {
    setAuth(null);
    navigate("/", { replace: true });
  };

  // Route guards
  const RequireAuth = ({ children }) => (auth ? children : <Navigate to="/" replace />);
  const RedirectIfAuthed = ({ children }) => (auth ? <Navigate to="/home" replace /> : children);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <Login onLoginSuccess={handleLoginSuccess} />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home user={auth} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/stock"
        element={
          <RequireAuth>
            <Stock user={auth} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <Tasks user={auth} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/team"
        element={
          <RequireAuth>
            <Team user={auth} onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={auth ? "/home" : "/"} replace />} />
    </Routes>
  );
}