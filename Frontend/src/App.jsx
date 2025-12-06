import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard"

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState("loading");
  const [user, setUser] = useState(null);

  // Helper function to set the current page based on user role
  const navigateToDashboard = (userData) => {
    const role = userData?.role;
    if (role === "admin" || role === "System Administrator") {
      setCurrentPage("adminDashboard");
    } else if (role === "store_owner") {
      setCurrentPage("storeOwnerDashboard");
    } else if (userData) {
      setCurrentPage("userDashboard");
    } else {
      setCurrentPage("login");
    }
  };

  // --- 1. Initial Authentication Check on page load/refresh ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check authentication using /api/me with credentials (cookie)
        const res = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          credentials: 'include', // CRITICAL: Sends HTTP-only cookie
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          navigateToDashboard(userData);
        } else {
          // Not authenticated
          setUser(null);
          setCurrentPage("login");
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
        setCurrentPage("login");
      }
    };

    checkAuthStatus();
  }, []);

  // --- 2. Handlers for State Changes ---

  // Called after a successful login/signup - backend sets cookie automatically
  const handleLogin = (userData) => {
    setUser(userData);
    navigateToDashboard(userData);
  }

  // Logout: Call backend to clear cookie
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookie to backend
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Always clear state and redirect
      setUser(null);
      setCurrentPage("login");
    }
  }

  // On successful signup, treat it as a successful login
  const handleSignup = (userData) => {
    handleLogin(userData);
  }

  // --- 3. Conditional Rendering ---

  if (currentPage === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-gray-600 animate-pulse">Checking session status...</p>
      </div>
    );
  }

  // Function to render the correct dashboard based on currentPage state
  const renderContent = () => {
      switch (currentPage) {
          case "login":
              return <Login onLoginSuccess={handleLogin} onNavigateToSignup={() => setCurrentPage("signup")} />;
          case "signup":
              return <Signup onSignupSuccess={handleSignup} onNavigateToLogin={() => setCurrentPage("login")} />;
          case "adminDashboard":
              return <AdminDashboard user={user} onLogout={handleLogout} />;
          case "userDashboard":
              return <UserDashboard user={user} onLogout={handleLogout} />;
          case "storeOwnerDashboard":
              return <StoreOwnerDashboard user={user} onLogout={handleLogout} />;
          default:
              return <Login onLoginSuccess={handleLogin} onNavigateToSignup={() => setCurrentPage("signup")} />;
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow container mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  )
}

export default App