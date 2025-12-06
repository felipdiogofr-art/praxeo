import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || searchLocation.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
    }
  };

  return (
    <header className="Header">
      <div className="container">
        <div className="Header-content">
          <Link to="/" className="Header-logo">
            <span className="Header-logo-text">Praxeo</span>
          </Link>

          <form className="Header-search" onSubmit={handleSearch}>
            <div className="Header-search-input-group">
              <input
                type="text"
                className="Header-search-input"
                placeholder="O que você precisa?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="Header-search-divider" />
              <input
                type="text"
                className="Header-search-input Header-search-location"
                placeholder="CEP ou Localização"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
              <button type="submit" className="Header-search-button" aria-label="Buscar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>

          <nav className="Header-nav">
            <Link to="/como-funciona" className="Header-nav-link">Como Funciona</Link>
            <Link to="/ajuda" className="Header-nav-link">Ajuda</Link>
            <button className="Header-button Header-button-secondary">
              Entrar
            </button>
            <button className="Header-button Header-button-primary">
              Alugar Meu Item
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;


