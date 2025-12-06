export default function StatsOverview({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
        <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 mb-2">Total Stores</p>
        <p className="text-4xl font-bold text-green-600">{stats.totalStores}</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 mb-2">Total Ratings</p>
        <p className="text-4xl font-bold text-purple-600">{stats.totalRatings}</p>
      </div>
    </div>
  )
}
