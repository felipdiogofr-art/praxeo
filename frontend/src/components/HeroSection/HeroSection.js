import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import LocationInput from '../LocationInput/LocationInput';
import './HeroSection.css';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { location } = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const locationParam = location?.cep || location?.address || '';
    if (searchQuery.trim() || locationParam) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationParam)}`);
    }
  };

  return (
    <section className="HeroSection">
      <div className="container">
        <div className="HeroSection-content">
          <h1 className="HeroSection-title">
            Aluguel de Equipamentos Médicos
            <span className="HeroSection-title-highlight"> Perto de Você</span>
          </h1>
          <p className="HeroSection-subtitle">
            Rápido, Seguro e Flexível. Encontre o equipamento que você precisa
            na sua região e alugue com apenas alguns cliques.
          </p>

          <form className="HeroSection-search" onSubmit={handleSearch}>
            <div className="HeroSection-search-container">
              <div className="HeroSection-search-group">
                <label htmlFor="hero-search" className="sr-only">
                  O que você precisa?
                </label>
                <input
                  id="hero-search"
                  type="text"
                  className="HeroSection-search-input"
                  placeholder="O que você precisa? (ex: cadeira de rodas, cama hospitalar)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="HeroSection-search-group HeroSection-search-location-wrapper">
                <LocationInput 
                  placeholder="CEP (ex: 01310-100)"
                  showGPSButton={false}
                  initialValue={location?.cep || ''}
                />
              </div>
              <button type="submit" className="HeroSection-search-button">
                Buscar
              </button>
            </div>
          </form>

          <div className="HeroSection-features">
            <div className="HeroSection-feature">
              <div className="HeroSection-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="HeroSection-feature-text">
                <strong>Próximo de Você</strong>
                <span>Encontre itens na sua região</span>
              </div>
            </div>
            <div className="HeroSection-feature">
              <div className="HeroSection-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="HeroSection-feature-text">
                <strong>Seguro</strong>
                <span>Caução e verificação garantidos</span>
              </div>
            </div>
            <div className="HeroSection-feature">
              <div className="HeroSection-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="HeroSection-feature-text">
                <strong>Rápido</strong>
                <span>Reserve em minutos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


