"use client"

import { useState, useEffect } from "react"

import Navbar from "../components/Navbar"
import StoreRatings from "../components/StoreOwnerComponents/StoreRatings"
import ChangePassword from "../components/UserComponents/ChangePassword"


export default function StoreOwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("ratings")
  const [store, setStore] = useState(null)
  const [ratings, setRatings] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    setLoading(true)
    try {
      
      const response = await fetch("http://localhost:5000/api/owned-stores", {
        credentials: "include", 
      })

      if (!response.ok) {
         console.error("Failed to fetch store ratings:", response.status)
         setRatings([])
         setStore(null)
         return
      }
      
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        
       
        const firstRating = data[0]
        const storeInfo = {
            id: firstRating.storeid,
            name: firstRating.storename,
            address: firstRating.storeaddress,
          
        }
        setStore(storeInfo)
        
       
        setRatings(data) 
        
    
        setAverageRating(Number(firstRating.average_store_rating)) 

      } else {
       
        setStore(null)
        setRatings([])
        setAverageRating(0)
      }

    } catch (err) {
      console.error("Failed to fetch store data:", err)
      setStore(null)
      setRatings([])
      setAverageRating(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {store && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{store.name}</h1>
            <p className="text-md text-gray-500 mb-6">{store.address}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col justify-center items-center">
                <p className="text-sm text-blue-600 font-semibold uppercase">Average Rating</p>
                <p className="text-4xl font-black text-blue-800 mt-1">
                  
                    {averageRating ? averageRating.toFixed(1) : "N/A"}/5
                </p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col justify-center items-center">
                <p className="text-sm text-gray-600 font-semibold uppercase">Total Ratings</p>
                <p className="text-4xl font-black text-gray-900 mt-1">{ratings.length}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold uppercase">Store ID</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{store.id}</p>
                
                <p className="text-sm text-gray-500 mt-2">Owner Contact Info Placeholder</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("ratings")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "ratings"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer Ratings
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

        {activeTab === "ratings" &&
          (loading ? (
            <div className="text-center py-8 text-gray-600">Loading Ratings...</div>
          ) : (
          
            <StoreRatings ratings={ratings} />
          ))}

        {activeTab === "password" && <ChangePassword userToken={user?.token} />}
      </div>
    </div>
  )
}