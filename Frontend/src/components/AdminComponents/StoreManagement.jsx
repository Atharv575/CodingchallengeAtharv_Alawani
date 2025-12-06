import React, { useState, useEffect } from "react"
import axios from "axios"; 


const API_BASE_URL = 'http://localhost:5000/api'; 

// Helper function to render star icons
const renderRatingStars = (ratingValue) => {
    const roundedRating = Math.round(ratingValue * 2) / 2; // Round to nearest 0.5
    
    return (
        <div className="flex items-center text-sm font-semibold">
            <span className="text-yellow-400 mr-1">{roundedRating.toFixed(1)}</span>
            {[...Array(5)].map((_, i) => (
                <span
                    key={i}
                    className={`w-4 h-4 rounded flex items-center justify-center text-base transition`}
                >
                    {/* Full Star */}
                    {roundedRating >= i + 1 ? <span className="text-yellow-500">★</span> :
                     // Half Star
                     roundedRating >= i + 0.5 ? <span className="text-yellow-500">½</span> :
                     // Empty Star
                     <span className="text-gray-300">☆</span>
                    }
                </span>
            ))}
        </div>
    );
};

export default function StoreManagement() { 
  const [stores, setStores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
 
  const [newStore, setNewStore] = useState({
    storeName: "",
    storeAddress: "",
    contactNo: "",
    storeOwnerId: "", 
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
        
      const response = await axios.get(`${API_BASE_URL}/values`, {
        withCredentials: true, // Sending session cookie for authentication
      })
      setStores(response.data)
        
    } catch (err) {
      console.error("Failed to fetch stores:", err)
    } finally {
      setLoading(false)
    }
  }

  const validateStore = () => {
    const newErrors = {}

    if (newStore.storeName.length < 5 || newStore.storeName.length > 100) {
      newErrors.storeName = "Store Name must be between 5 and 100 characters."
    }

    const phoneRegex = /^\+?(\d[\d\s-]{5,})\d$/;
    if (!phoneRegex.test(newStore.contactNo)) {
      newErrors.contactNo = "Invalid contact number format."
    }

    if (newStore.storeAddress.length > 400 || newStore.storeAddress.length < 10) {
      newErrors.storeAddress = "Address must be between 10 and 400 characters."
    }
    
    
    if (!newStore.storeOwnerId) {
        newErrors.storeOwnerId = "Store Owner ID is required to link the store to a user."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddStore = async (e) => {
    e.preventDefault()

    if (!validateStore()) {
      return
    }

    try {
      
      const response = await axios.post(`${API_BASE_URL}/stores`, newStore, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })

      if (response.status === 201 || response.status === 200) {
        setShowForm(false)
        setNewStore({
          storeName: "",
          storeAddress: "",
          contactNo: "",
          storeOwnerId: "", // Reset the owner ID field
        })
        fetchStores()
      }
    } catch (err) {
      console.error("Failed to add store:", err)
    }
  }

  const filteredStores = stores.filter(
    (store) =>
      store.storename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.contactno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.storeaddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()), 
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 sm:mb-0">Store Management Dashboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg w-full sm:w-auto"
        >
          {showForm ? "Close Form" : "Register New Store"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-2xl p-6 mb-8 border border-gray-100 transition-all duration-300 ease-in-out">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">Store Registration</h3>
          <form onSubmit={handleAddStore} className="space-y-6">
            
            {/* New field for Store Owner ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Owner User ID (Must exist)</label>
              <input
                type="text"
                value={newStore.storeOwnerId}
                onChange={(e) => setNewStore({ ...newStore, storeOwnerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="User ID (e.g., owner-456)"
              />
              {errors.storeOwnerId && <p className="text-red-600 text-xs mt-1">{errors.storeOwnerId}</p>}
            </div>
            
            {/* Store Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={newStore.storeName}
                onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., The Local Market"
              />
              {errors.storeName && <p className="text-red-600 text-xs mt-1">{errors.storeName}</p>}
            </div>
            
            {/* Contact No. Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
              <input
                type="tel"
                value={newStore.contactNo}
                onChange={(e) => setNewStore({ ...newStore, contactNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 555-123-4567"
              />
              {errors.contactNo && <p className="text-red-600 text-xs mt-1">{errors.contactNo}</p>}
            </div>
            
            {/* Store Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
              <textarea
                value={newStore.storeAddress}
                onChange={(e) => setNewStore({ ...newStore, storeAddress: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address including city and postal code"
              />
              {errors.storeAddress && <p className="text-red-600 text-xs mt-1">{errors.storeAddress}</p>}
            </div>

            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-lg">
              Add Store
            </button>
          </form>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search stores by name, contact, address, or owner email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading stores...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Store Name</th>
                 
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact No.</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <tr key={store.storeid} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.storename}</td>
                    {/*  Displaying ownerEmail */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{store.ownerEmail || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.contactno}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{store.storeaddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {/*  Displaying averageRating */}
                      {renderRatingStars(Number(store.averageRating))}
                    </td>
                  </tr>
                ))}
                {filteredStores.length === 0 && !loading && (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No stores found matching your criteria.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
   )}
    </div>
  )
}