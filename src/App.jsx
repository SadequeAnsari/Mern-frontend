import React from 'react'
import {BrowserRouter , Routes, Route} from 'react-router-dom'
import Login from './components/Login'
import Signup from './components/Signup'
import Home from './components/Home'
import EditProfile from './components/EditProfile'
import VerifyEmail from './components/VerifyEmail'
import SetUserId from './components/SetUserId'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './components/ForgotPassword'
import UserProfile from './components/UserProfile'
import UserManagement from './components/UserManagement'
import Profile from './components/Profile'

const App = () => {
  
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/" element={<Home/>} />
        <Route path='/edit-profile' element={<ProtectedRoute><EditProfile/></ProtectedRoute>} />
        <Route path='/verify-email' element={<ProtectedRoute><VerifyEmail/></ProtectedRoute>} />
        <Route path='/set-userid' element={<SetUserId/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user-profile" element={<ProtectedRoute><UserProfile/></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute><UserManagement/></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<Profile />} /> 
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App