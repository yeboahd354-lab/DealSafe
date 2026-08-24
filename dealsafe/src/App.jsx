import { useEffect, useState } from 'react'
import Home from './Components/Home'
import Login from './Components/Login'
import Signup from './Components/Signup'
import Dashboard from './Components/Dashboard'
import CreateDealPage from './Pages/CreateDeal'
import Transaction from './Pages/Transaction'
import Disputes from './Pages/Disputes'
import Notifications from './Pages/Notifications'
import PayoutSettings from './Pages/PayoutSettings'
import Profile from './Pages/Profile'
import Help from './Pages/Help'
import Payment from './Pages/Payment'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import './App.css'

function AppRoutes({ user }) {
  const signedIn = Boolean(user)

  return (
    <Routes>
      <Route path="/login" element={signedIn ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={signedIn ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/dashboard/create-deal" element={signedIn ? <CreateDealPage /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/transactions/:transactionId" element={signedIn ? <Transaction /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/transactions/:transactionId/payment" element={signedIn ? <Payment /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/transactions" element={signedIn ? <Transaction /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/disputes" element={signedIn ? <Disputes /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/notifications" element={signedIn ? <Notifications /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/payout-settings" element={signedIn ? <PayoutSettings /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/profile" element={signedIn ? <Profile /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/help" element={signedIn ? <Help /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard/*" element={signedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="*" element={signedIn ? <Navigate to="/dashboard" replace /> : <Home />} />
    </Routes>
  )
}

function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  if (user === undefined) return <div className="grid min-h-screen place-items-center bg-[#f7f9f4] text-sm text-[#637777]">Loading your DealSafe session...</div>

  return (
    <BrowserRouter>
      <AppRoutes user={user} />
    </BrowserRouter>
  )
}

export default App
