"use client"

import { useState, useEffect } from "react"

import Navbar from "../components/Navbar"
import StoresList from "../components/UserComponents/StoresList"
import ChangePassword from "../components/UserComponents/ChangePassword"

export default function UserDashboard({user, onLogout }) {
  const [activeTab, setActiveTab] = useState("stores")
  const [stores, setStores] = useState([])
  const [userRatings, setUserRatings] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
        fetchStores()
        fetchUserRatings()
    }
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/stores/values", {
        credentials: "include", 
      })
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", response.status, errorText);
        setStores([]); 
        return;
      }
      
      const data = await response.json()
      
     
      const formattedStores = data.map(store => ({
        
          storeId: store.storeid,
          storeName: store.storename,
          storeAddress: store.storeaddress,
          contactNo: store.contactno,
          userId: store.userid,
          createdAt: store.created_at,
          
          averageRating: store.averagerating, 
      }));
      
      setStores(formattedStores)
    } catch (err) {
      console.error("Failed to fetch stores:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRatings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/ratings/my-ratings", {
        credentials: "include", 
      })
      const data = await response.json()
      const ratingsMap = {}
      data.forEach((rating) => {
        
        ratingsMap[rating.storeId] = rating.rating 
      })
      setUserRatings(ratingsMap)
    } catch (err) {
      console.error("Failed to fetch ratings:", err)
    }
  }

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      const response = await fetch("http://localhost:5000/api/ratings", {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          rating,
        }),
      })

      if (response.ok) {
        setUserRatings((prev) => ({
          ...prev,
          [storeId]: rating,
        }))
       
        fetchStores() 
      }
    } catch (err) {
      console.error("Failed to submit rating:", err)
    }
  }

  // Filtering logic uses the consistent camelCase names (storeName, storeAddress)
  const filteredStores = stores.filter(
    (store) =>
      store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.storeAddress?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("stores")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "stores"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Stores
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "password"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Change Password
          </button>
        </div>

        {activeTab === "stores" && (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search stores by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading stores...</div>
            ) : (
              <StoresList stores={filteredStores} userRatings={userRatings} onRatingSubmit={handleRatingSubmit} />
            )}
          </>
        )}

        {activeTab === "password" && <ChangePassword />}
      </div>
    </div>
  )
}