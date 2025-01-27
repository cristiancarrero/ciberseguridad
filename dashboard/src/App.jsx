import React from 'react'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import './styles/App.css'
import Chatbox from './Chatbox'

function App() {
  return (
    <div className="app-root">
      <Navbar />
      <div className="app-content">
        <Dashboard />
        <Chatbox />
      </div>
    </div>
  )
}

export default App
