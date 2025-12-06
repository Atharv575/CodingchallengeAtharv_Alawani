"use client"


export default function StoreRatings({ ratings = [] }) {
  return (
    <div className="space-y-4">
      {ratings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No ratings yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Store Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ratings.map((rating) => (
                  <tr 
                    
                    key={rating.ratingid} 
                    className="hover:bg-gray-50"
                  >
                    {/* Display Store Name */}
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{rating.storename}</td>
                    
                   
                    <td className="px-6 py-3 text-sm text-gray-900">{rating.rated_by_username}</td>
                    
                    <td className="px-6 py-3 text-sm">
                      <span className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded flex items-center justify-center text-lg ${
                              i < rating.rating ? "bg-yellow-400 text-yellow-600" : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    </td>
                    
                   
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(rating.rated_at).toLocaleDateString()}
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