import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/busca" element={<Search />} />
              <Route path="/produto/:id" element={<ProductDetail />} />
              
              {/* Rotas protegidas - Exemplos de uso do PrivateRoute */}
              {/* 
              <Route 
                path="/perfil" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/reservas" 
                element={
                  <PrivateRoute>
                    <ReservationsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute requiredRole="owner">
                    <OwnerDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/publicar" 
                element={
                  <PrivateRoute requiredRole="owner">
                    <PublishProductPage />
                  </PrivateRoute>
                } 
              />
              */}
            </Routes>
          </Layout>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;


