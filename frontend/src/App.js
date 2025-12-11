import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Checkout from './pages/Checkout/Checkout';
import Confirmation from './pages/Checkout/Confirmation';
import OwnerDashboard from './pages/OwnerDashboard/OwnerDashboard';
import PublishProductPage from './pages/PublishProduct/PublishProductPage';
import EditProductPage from './pages/EditProduct/EditProductPage';
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
              
              {/* Rotas protegidas */}
              <Route 
                path="/checkout" 
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/reserva/confirmacao" 
                element={
                  <PrivateRoute>
                    <Confirmation />
                  </PrivateRoute>
                } 
              />
              
              {/* Rotas protegidas - Dashboard do Proprietário */}
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
              <Route 
                path="/produto/:id/editar" 
                element={
                  <PrivateRoute requiredRole="owner">
                    <EditProductPage />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;


