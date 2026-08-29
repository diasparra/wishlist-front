import { createRoot } from 'react-dom/client'
import './index.css'
import RootLayout from './layouts/RootLayout.tsx'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <RootLayout>
    <App />
  </RootLayout>,
)
