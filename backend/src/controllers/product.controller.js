const ProductService = require('../services/product.service');

/**
 * Controller de Produtos
 * Gerencia requisições HTTP relacionadas a produtos
 */
class ProductController {
  /**
   * GET /api/products
   * Lista produtos com filtros opcionais
   */
  static async getProducts(req, res) {
    try {
      const filters = {
        lat: req.query.lat,
        lng: req.query.lng,
        radius: req.query.radius,
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        availability: req.query.availability,
        search: req.query.search
      };

      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await ProductService.getProducts(filters, pagination);

      return res.status(200).json({
        message: 'Produtos listados com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);

      return res.status(500).json({
        error: 'Erro ao listar produtos',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * GET /api/products/:id
   * Busca um produto por ID
   */
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductService.getProductById(id);

      return res.status(200).json({
        message: 'Produto encontrado',
        data: product
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao buscar produto',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * POST /api/products
   * Cria um novo produto (requer autenticação)
   */
  static async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body, req.userId);

      return res.status(201).json({
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);

      if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        return res.status(400).json({
          error: 'Erro de validação',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao criar produto',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * PUT /api/products/:id
   * Atualiza um produto (requer autenticação e propriedade)
   */
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await ProductService.updateProduct(id, req.body, req.userId);

      return res.status(200).json({
        message: 'Produto atualizado com sucesso',
        data: product
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: error.message
        });
      }

      if (error.message.includes('permissão')) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar produto',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * DELETE /api/products/:id
   * Deleta um produto (requer autenticação e propriedade)
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      await ProductService.deleteProduct(id, req.userId);

      return res.status(200).json({
        message: 'Produto deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);

      if (error.message === 'Produto não encontrado') {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: error.message
        });
      }

      if (error.message.includes('permissão')) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao deletar produto',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }
}

module.exports = ProductController;

