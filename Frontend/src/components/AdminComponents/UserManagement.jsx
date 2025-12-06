"use client"

import { useState, useEffect } from "react"


export default function UserManagement() { 
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      // credentials: 'include' ensures the browser sends the HTTP-only cookie
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "GET",
        credentials: "include", 
      })

      const data = await response.json()
      
      if (response.ok) {
        setUsers(data)
      } else {
       
        setError(data.message || "Failed to fetch users. Check console for details.")
        setUsers([])
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setError("Connection error or server not running.")
    } finally {
      setLoading(false)
    }
  }

  const validateUser = () => {
    const newErrors = {}

    if (newUser.name.length < 20 || newUser.name.length > 60) {
      newErrors.name = "Name must be 20-60 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.email)) {
      newErrors.email = "Invalid email"
    }

    // Using the same password regex from the backend validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    if (!passwordRegex.test(newUser.password)) {
      newErrors.password = "Password must be 8-16 chars with 1 uppercase and 1 special char"
    }

    if (newUser.address.length > 400) {
      newErrors.address = "Address max 400 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateUser()) {
      return
    }

    try {
      // credentials: 'include' ensures the browser sends the HTTP-only cookie
      const response = await fetch("http://localhost:5000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT for cookie auth
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        
        setShowForm(false)
        setNewUser({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "Normal User",
        })
        fetchUsers()
      } else {
        setError(data.message || "Failed to add user.")
      }
    } catch (err) {
      console.error("Failed to add user:", err)
      setError("Connection error or server not running.")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     
      (user.address || "").toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchRole = filterRole === "all" || user.role.toLowerCase() === filterRole.toLowerCase().replace(" ", "_")
    return matchSearch && matchRole
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Users Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setErrors({}) 
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? "Cancel" : "Add New User"}
        </button>
      </div>
      
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-6 font-medium">Error: {error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Full name (20-60 chars)"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Normal User">Normal user</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">store_owner</option>
                  
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Address (max 400 chars)"
                />
                {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>

            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Add User
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="Normal User">Normal User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
            <option value="System Administrator">System Administrator</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading users...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.userid} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{user.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{user.address}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          (user.role === "admin" || user.role === "System Administrator")
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "store_owner"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}