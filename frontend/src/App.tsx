import './App.css'
import ClickCounter from './components/ClickCounter'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="p-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Redis Click Counter</h1>
        <p className="text-gray-400">A real-time distributed counter using Redis queues</p>
      </header>

      {/* Main Content */}
      <main>
        <ClickCounter />
      </main>

      {/* Info Section */}
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-400">
        <h2 className="text-xl font-semibold mb-3 text-white">How it works</h2>
        <p className="mb-4">
          This counter uses Redis to manage distributed click counting with rate limiting.
          Each user is limited to 10 clicks every 10 seconds, and clicks are processed through a Redis queue.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Rate Limiting</h3>
            <p>Maximum 10 clicks per 10 seconds per user</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Queue Processing</h3>
            <p>Clicks are processed asynchronously via Redis queue</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Real-time Updates</h3>
            <p>Counter updates in real-time across all connected clients</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center p-6 text-gray-500 text-sm">
        <p>Built with React, Redis, and Express</p>
      </footer>
    </div>
  )
}

export default App