import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublishProductWizard from '../../components/PublishProduct/PublishProductWizard';
import './PublishProductPage.css';

/**
 * Página de Publicação de Produto
 * 
 * Página wrapper para o PublishProductWizard
 */
const PublishProductPage = () => {
  const navigate = useNavigate();

  const handleSuccess = (product) => {
    // Redirecionar para o dashboard após publicação
    navigate('/dashboard', { 
      state: { 
        message: 'Produto publicado com sucesso!',
        product 
      } 
    });
  };

  const handleCancel = () => {
    // Voltar para o dashboard
    navigate('/dashboard');
  };

  return (
    <div className="PublishProductPage">
      <div className="container">
        <div className="PublishProductPage-header">
          <h1 className="PublishProductPage-title">Publicar Novo Produto</h1>
          <p className="PublishProductPage-subtitle">
            Preencha as informações abaixo para publicar seu equipamento
          </p>
        </div>
        <PublishProductWizard 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default PublishProductPage;

