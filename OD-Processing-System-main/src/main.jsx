import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

// import app from '../server/server.js'

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container)



root.render(
  <React.StrictMode>
      <BrowserRouter>
      <App />
  </BrowserRouter>
    </React.StrictMode>
  
);
