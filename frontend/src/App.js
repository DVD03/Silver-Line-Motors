import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import VehicleDetails from './pages/VehicleDetails';
import AuctionsList from './pages/AuctionsList';
import Auctions from './pages/Auctions';
import RentalsList from './pages/RentalsList';
import Rentals from './pages/Rentals';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyRentals from './pages/MyRentals';
import MySales from './pages/MySales';
import AddVehicle from './pages/AddVehicle';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

import './theme.css';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <NavBar />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/auctions" element={<AuctionsList />} />
              <Route path="/rentals" element={<RentalsList />} />

              {/* Auth pages – redirect if already logged in handled inside components */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Protected – requires login */}
              <Route path="/auctions/:id" element={<ProtectedRoute><Auctions /></ProtectedRoute>} />
              <Route path="/rentals/:id" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/my-rentals" element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
              <Route path="/my-sales" element={<ProtectedRoute><MySales /></ProtectedRoute>} />
              <Route path="/add-vehicle" element={<ProtectedRoute><AddVehicle /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}