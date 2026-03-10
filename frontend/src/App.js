import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home   from "./pages/Home";
import Login  from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

// Protects routes — redirects to /login if no token found
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  // ── Dismiss the splash screen once React has fully mounted ──
  useEffect(() => {
    if (typeof window.__bvHideSplash === "function") {
      window.__bvHideSplash();
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;