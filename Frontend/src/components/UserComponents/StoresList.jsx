"use client"

export default function StoresList({ stores, userRatings, onRatingSubmit }) {
  const renderStars = (rating, onRate, interactive = true) => {
    // Ensuring rating is a number for rendering logic
    const safeRating = Number(rating) || 0; 

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate(star)}
            disabled={!interactive}
            className={`w-6 h-6 rounded text-xl flex items-center justify-center ${
              star <= safeRating ? "bg-yellow-400 text-yellow-600 shadow-md" : "bg-gray-200 text-gray-400"
            } ${interactive ? "hover:bg-yellow-300 cursor-pointer" : "cursor-default"} transition duration-150`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {stores.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <p className="text-lg font-semibold text-gray-600">No stores found</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        stores.map((store) => (
          // FIX: Use store.storeId for the key
          <div key={store.storeId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                {/* FIX: Use store.storeName */}
                <h3 className="text-xl font-bold text-gray-900">{store.storeName}</h3>
                {/* FIX: Use store.storeAddress */}
                <p className="text-sm text-gray-600 mt-1">{store.storeAddress}</p>
                <p className="text-xs text-gray-400 mt-1">Contact: {store.contactNo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Average Rating</p>
                 {/* FIX: Display average rating if available. Assuming the backend adds 'averageRating' */}
                 <p className="text-3xl font-extrabold text-blue-600">
                    {store.averageRating ? store.averageRating.toFixed(1) : "N/A"}
                 </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Your Rating</p>
               
                {renderStars(
                    userRatings[store.storeId] || 0, 
                    (rating) => onRatingSubmit(store.storeId, rating), // FIX: Use store.storeId here
                    true
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}