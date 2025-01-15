import React from 'react'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import './styles/App.css'

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <div className="app-content">
        <Dashboard />
      </div>
    </div>
  )
}

export default App
