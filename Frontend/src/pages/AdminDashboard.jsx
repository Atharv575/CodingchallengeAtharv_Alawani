"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import UserManagement from "../components/AdminComponents/UserManagement"
import StoreManagement from "../components/AdminComponents/StoreManagement"
import StatsOverview from "../components/AdminComponents/StatsOverview"

export default function AdminDashboard({ user,onLogout }) {
  const [activeTab, setActiveTab] = useState("stats")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stats", {
        credentials: "include",
      })
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "stats"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Dashboard Stats
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Users
          </button>
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
        </div>

        {activeTab === "stats" && <StatsOverview stats={stats} />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "stores" && <StoreManagement />}
      </div>
    </div>
  )
}