import React from 'react'
import { AWSProvider } from './context/AWSContext'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import './styles/App.css'
import './styles/global-select.css'

function App() {
  return (
    <AWSProvider>
      <div className="app-root">
        <Navbar />
        <div className="app-content">
          <Dashboard />
        </div>
      </div>
    </AWSProvider>
  )
}

export default App
