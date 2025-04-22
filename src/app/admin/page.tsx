export default function AdminDashboard() {
    return (
      <div className="min-h-screen flex bg-gray-100 dark:bg-[#111]">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-[#1c1c1c] shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Admin Panel</h2>
            <nav className="space-y-2">
              <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Dashboard</a>
              <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Users</a>
              <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Reports</a>
              <a href="#" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600">Settings</a>
            </nav>
          </div>
        </aside>
  
        {/* Main content */}
        <main className="flex-1 p-8">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold">
              Logout
            </button>
          </header>
  
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">1,240</p>
            </div>
  
            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Active Reports</h3>
              <p className="text-2xl font-bold text-green-500">58</p>
            </div>
  
            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Pending Requests</h3>
              <p className="text-2xl font-bold text-yellow-500">14</p>
            </div>
          </section>
        </main>
      </div>
    );
  }
  