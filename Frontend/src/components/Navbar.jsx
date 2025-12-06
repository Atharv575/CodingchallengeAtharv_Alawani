import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Navbar({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from /api/me on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          credentials: 'include', //  Sends HTTP-only cookie
        });

        if (!response.ok) {
          throw new Error('User session expired or not authenticated.');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setUser(null);
        setError(err.message);
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        // Call parent's onLogout if provided
        if (onLogout) {
          onLogout();
        } else {
          // Fallback: reload page
          window.location.href = '/';
        }
      } else {
        throw new Error('Logout failed on the server.');
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Even on error, clear local state
      setUser(null);
      if (onLogout) onLogout();
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md h-16 flex items-center justify-end pr-8">
        <span className="text-gray-500">Loading user info...</span>
      </nav>
    );
  }

  // Handle unauthenticated state
  if (!user || error) {
    return (
      <nav className="bg-white shadow-md h-16 flex items-center justify-between px-8">
        <div className="font-bold text-gray-900">Store Ratings</div>
        <div className="text-red-500">Authentication Required</div>
      </nav>
    );
  }

  // Render authenticated navbar
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SR</span>
            </div>
            <span className="font-bold text-gray-900">Store Ratings</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}