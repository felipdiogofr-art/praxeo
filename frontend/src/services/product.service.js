import api from './api';

/**
 * Serviço de Produtos
 * 
 * Este módulo fornece funções para gerenciar produtos,
 * incluindo listagem, busca, criação, atualização e exclusão.
 * 
 * @module services/product
 */

/**
 * Lista produtos com filtros opcionais
 * 
 * @param {Object} [filters={}] - Objeto com filtros de busca
 * @param {number} [filters.lat] - Latitude para busca por geolocalização
 * @param {number} [filters.lng] - Longitude para busca por geolocalização
 * @param {number} [filters.radius] - Raio de busca em km (padrão: 10)
 * @param {string} [filters.category] - Categoria do produto
 * @param {number} [filters.minPrice] - Preço mínimo
 * @param {number} [filters.maxPrice] - Preço máximo
 * @param {string} [filters.search] - Termo de busca (busca em título e descrição)
 * @param {string} [filters.condition] - Condição do produto ('new', 'used', 'refurbished')
 * @param {boolean} [filters.availability] - Filtrar por disponibilidade (true/false)
 * @param {string} [filters.sortBy] - Campo para ordenação ('price', 'distance', 'rating', 'createdAt')
 * @param {string} [filters.order] - Ordem ('asc' ou 'desc', padrão: 'asc')
 * @param {number} [filters.page] - Número da página para paginação
 * @param {number} [filters.limit] - Limite de itens por página
 * @returns {Promise<Object>} Objeto contendo produtos e metadados (total, page, limit)
 * @throws {Error} Erro caso ocorra falha na requisição
 * 
 * @example
 * // Buscar produtos próximos a uma localização
 * const products = await ProductService.getProducts({
 *   lat: -23.5505,
 *   lng: -46.6333,
 *   radius: 5,
 *   category: 'medical-equipment'
 * });
 * 
 * @example
 * // Buscar produtos por termo e preço
 * const products = await ProductService.getProducts({
 *   search: 'bisturi',
 *   minPrice: 100,
 *   maxPrice: 500
 * });
 */
export const getProducts = async (filters = {}) => {
  try {
    // Construir query string com os filtros
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : '/products';

    const response = await api.get(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém detalhes de um produto específico
 * 
 * @param {string|number} id - ID do produto
 * @returns {Promise<Object>} Objeto contendo os dados completos do produto
 * @throws {Error} Erro caso o produto não seja encontrado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const product = await ProductService.getProductById(1);
 *   console.log('Produto:', product);
 * } catch (error) {
 *   if (error.status === 404) {
 *     console.error('Produto não encontrado');
 *   }
 * }
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cria um novo produto
 * 
 * Requer autenticação (usuário deve estar logado).
 * 
 * @param {Object} productData - Dados do produto
 * @param {string} productData.title - Título do produto
 * @param {string} productData.description - Descrição do produto
 * @param {string} productData.category - Categoria do produto
 * @param {number} productData.price - Preço diário de aluguel
 * @param {string} productData.condition - Condição ('new', 'used', 'refurbished')
 * @param {number} productData.lat - Latitude da localização
 * @param {number} productData.lng - Longitude da localização
 * @param {string} productData.address - Endereço completo
 * @param {string} productData.cep - CEP
 * @param {string[]} [productData.images] - Array de URLs das imagens
 * @param {boolean} [productData.availability=true] - Disponibilidade do produto
 * @returns {Promise<Object>} Objeto contendo os dados do produto criado
 * @throws {Error} Erro caso os dados sejam inválidos ou o usuário não esteja autenticado
 * 
 * @example
 * try {
 *   const product = await ProductService.createProduct({
 *     title: 'Bisturi Elétrico',
 *     description: 'Bisturi elétrico profissional...',
 *     category: 'medical-equipment',
 *     price: 150.00,
 *     condition: 'new',
 *     lat: -23.5505,
 *     lng: -46.6333,
 *     address: 'Rua Exemplo, 123 - São Paulo, SP',
 *     cep: '01234567'
 *   });
 *   console.log('Produto criado:', product);
 * } catch (error) {
 *   console.error('Erro ao criar produto:', error.message);
 * }
 */
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza um produto existente
 * 
 * Requer autenticação. Apenas o proprietário do produto pode atualizá-lo.
 * 
 * @param {string|number} id - ID do produto a ser atualizado
 * @param {Object} productData - Dados do produto a serem atualizados (apenas os campos que deseja alterar)
 * @returns {Promise<Object>} Objeto contendo os dados atualizados do produto
 * @throws {Error} Erro caso o produto não seja encontrado, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const updatedProduct = await ProductService.updateProduct(1, {
 *     price: 200.00,
 *     availability: false
 *   });
 *   console.log('Produto atualizado:', updatedProduct);
 * } catch (error) {
 *   if (error.status === 403) {
 *     console.error('Você não tem permissão para atualizar este produto');
 *   }
 * }
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deleta um produto
 * 
 * Requer autenticação. Apenas o proprietário do produto pode deletá-lo.
 * 
 * @param {string|number} id - ID do produto a ser deletado
 * @returns {Promise<Object>} Objeto contendo mensagem de sucesso
 * @throws {Error} Erro caso o produto não seja encontrado, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   await ProductService.deleteProduct(1);
 *   console.log('Produto deletado com sucesso');
 * } catch (error) {
 *   console.error('Erro ao deletar produto:', error.message);
 * }
 */
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exportar objeto com todas as funções para facilitar uso
const ProductService = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default ProductService;
