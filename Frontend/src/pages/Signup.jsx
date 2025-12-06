"use client"

import { useState } from "react"


export default function Signup({ onSignupSuccess, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    // Name validation: 20-60 characters
    if (formData.name.length < 20 || formData.name.length > 60) {
      newErrors.name = "Name must be between 20 and 60 characters."
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address."
    }

    // Address validation: max 400 characters
    if (formData.address.length > 400) {
      newErrors.address = "Address must not exceed 400 characters."
    }

    // Password validation: 8-16 chars, 1 uppercase, 1 special char
    // Includes a range of standard special characters
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must be 8-16 characters with at least 1 uppercase and 1 special character."
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    // Clear submit error on change
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({}) 

    try {
     
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address,
          password: formData.password,
        }),
        credentials: "include", 
      })

      const data = await response.json()

      if (response.ok) {
       
        onSignupSuccess({
          userid: data.user.userid, 
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
         
        })
       
      } else {
        // Handle server-side errors (e.g., email already taken)
        setErrors({ submit: data.message || "Signup failed due to a server error." })
      }
    } catch (err) {
      console.error("Signup error:", err)
      setErrors({ submit: "Connection error. Make sure the backend is running and accessible." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transform transition hover:shadow-3xl duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-700">Join Us</h1>
          <p className="text-gray-500 mt-2">Sign up as a Normal User to start rating stores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              placeholder="Min 20, Max 60 characters"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className={`w-full px-4 py-2 border ${errors.address ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              placeholder="Max 400 characters"
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="text-red-600 text-xs mt-1 font-medium">{errors.address}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.password ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
            />
            <small className="text-gray-400 text-xs mt-1 block">8-16 chars, $\ge 1$ uppercase, $\ge 1$ special character.</small>
            {errors.password && <p className="text-red-600 text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              placeholder="••••••••"
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm font-medium">{errors.submit}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.01] duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <button onClick={onNavigateToLogin} className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}