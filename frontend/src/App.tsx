import './App.css'
import ClickCounter from './components/ClickCounter'
import ClickSystemExplainer from './components/ClickSystemExplainer'

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
        <ClickSystemExplainer />
      </main>

      {/* Footer */}
      <footer className="text-center p-6 text-gray-500 text-sm">
        <p>Built with React, Redis, and Express</p>
      </footer>
    </div>
  )
}

export default App