import { useState } from 'react'
import './App.css'
import AppRouter from './routers/AppRouter'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

function App() {
  return (
    <>

    {/* routes correctly*/}
     <AppRouter />
    </>
  )
}

export default App
