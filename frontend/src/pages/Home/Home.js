import React from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import './Home.css';

const Home = () => {
  return (
    <div className="Home">
      <HeroSection />
      <div className="container">
        <section className="Home-section">
          <h2 className="Home-section-title">Como Funciona</h2>
          <div className="Home-steps">
            <div className="Home-step">
              <div className="Home-step-number">1</div>
              <h3 className="Home-step-title">Busque</h3>
              <p className="Home-step-description">
                Encontre o equipamento que você precisa na sua região usando nossa busca por localização.
              </p>
            </div>
            <div className="Home-step">
              <div className="Home-step-number">2</div>
              <h3 className="Home-step-title">Reserve</h3>
              <p className="Home-step-description">
                Selecione as datas desejadas e faça sua reserva de forma rápida e segura.
              </p>
            </div>
            <div className="Home-step">
              <div className="Home-step-number">3</div>
              <h3 className="Home-step-title">Receba</h3>
              <p className="Home-step-description">
                Combine a entrega ou retirada com o proprietário e aproveite seu equipamento.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


