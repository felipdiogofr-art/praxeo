const { Product, User, Review, Reservation, sequelize } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Serviço de Produtos
 * Gerencia lógica de negócio relacionada a produtos
 */
class ProductService {
  /**
   * Lista produtos com filtros opcionais
   * @param {Object} filters - Filtros de busca (lat, lng, radius, category, minPrice, maxPrice, availability, search)
   * @param {Object} pagination - Paginação (page, limit)
   * @returns {Object} - Lista de produtos e metadados de paginação
   */
  static async getProducts(filters = {}, pagination = {}) {
    const {
      lat,
      lng,
      radius = 10, // raio em km
      category,
      minPrice,
      maxPrice,
      availability = true,
      search,
      userId // Filtrar por proprietário
    } = filters;

    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 20;
    const offset = (page - 1) * limit;

    const where = {};

    // Filtro de disponibilidade
    if (availability !== undefined) {
      where.availability = availability === 'true' || availability === true;
    }

    // Filtro de categoria
    if (category) {
      where.category = category;
    }

    // Filtro de preço
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    // Filtro de busca por texto (título ou descrição)
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por proprietário (userId)
    if (userId) {
      where.userId = userId;
    }

    const queryOptions = {
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['rating'],
          required: false
        }
      ],
      limit,
      offset,
      order: []
    };

    // Busca por geolocalização (PostGIS)
    let hasGeolocation = false;
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      // Validação de coordenadas
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Latitude e longitude devem ser números válidos');
      }
      
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude deve estar entre -90 e 90');
      }
      
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude deve estar entre -180 e 180');
      }

      const radiusInMeters = parseFloat(radius) * 1000; // converter km para metros
      
      if (isNaN(radiusInMeters) || radiusInMeters <= 0) {
        throw new Error('Raio deve ser um número positivo');
      }

      hasGeolocation = true;

      // Adicionar cálculo de distância usando PostGIS
      // Usar COALESCE para tratar produtos sem localização (retornar null)
      // Converter para numeric antes de usar ROUND (PostgreSQL requer numeric para ROUND com 2 argumentos)
      queryOptions.attributes = {
        include: [
          [
            sequelize.literal(`
              CASE 
                WHEN location IS NOT NULL THEN
                  ROUND(
                    CAST(
                      ST_Distance(
                        location::geography,
                        ST_MakePoint(${sequelize.escape(longitude)}, ${sequelize.escape(latitude)})::geography
                      ) / 1000.0 AS numeric
                    ),
                    2
                  )
                ELSE NULL
              END
            `),
            'distance'
          ]
        ]
      };

      // Filtrar por raio usando ST_DWithin (apenas produtos com localização dentro do raio)
      const locationFilter = sequelize.literal(`
        location IS NOT NULL AND ST_DWithin(
          location::geography,
          ST_MakePoint(${sequelize.escape(longitude)}, ${sequelize.escape(latitude)})::geography,
          ${radiusInMeters}
        )
      `);
      
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(locationFilter);

      // Ordenar por distância (ASC), depois por rating médio (DESC), depois por preço (ASC)
      queryOptions.order.push([
        sequelize.literal('distance'),
        'ASC'
      ]);
      queryOptions.order.push([
        sequelize.literal(`(
          SELECT COALESCE(AVG(rating), 0)
          FROM reviews
          WHERE reviews.product_id = "Product".id
        )`),
        'DESC'
      ]);
      queryOptions.order.push(['price', 'ASC']);
    } else {
      // Ordenação padrão: mais recentes primeiro, depois por rating, depois por preço
      queryOptions.order.push(['createdAt', 'DESC']);
      queryOptions.order.push([
        sequelize.literal(`(
          SELECT COALESCE(AVG(rating), 0)
          FROM reviews
          WHERE reviews.product_id = "Product".id
        )`),
        'DESC'
      ]);
      queryOptions.order.push(['price', 'ASC']);
    }

    const { count, rows } = await Product.findAndCountAll(queryOptions);

    // Calcular rating médio e formatar distância para cada produto
    const productsWithRating = rows.map(product => {
      const productData = product.toJSON();
      
      // Calcular rating médio
      if (productData.reviews && productData.reviews.length > 0) {
        const ratings = productData.reviews.map(r => r.rating);
        productData.averageRating = parseFloat(
          (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
        );
        productData.reviewCount = ratings.length;
      } else {
        productData.averageRating = null;
        productData.reviewCount = 0;
      }

      // Formatar distância (garantir que seja um número ou null)
      if (hasGeolocation) {
        if (productData.distance !== null && productData.distance !== undefined) {
          productData.distance = parseFloat(parseFloat(productData.distance).toFixed(2));
        } else {
          productData.distance = null;
        }
      }

      // Remover array de reviews do objeto principal (já calculamos o rating)
      delete productData.reviews;

      return productData;
    });

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Busca um produto por ID
   * @param {string} productId - ID do produto
   * @returns {Object} - Dados do produto
   */
  static async getProductById(productId) {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 10
        }
      ]
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    const productData = product.toJSON();

    // Calcular rating médio
    if (productData.reviews && productData.reviews.length > 0) {
      const ratings = productData.reviews.map(r => r.rating);
      productData.averageRating = (
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      ).toFixed(1);
      productData.reviewCount = ratings.length;
    } else {
      productData.averageRating = null;
      productData.reviewCount = 0;
    }

    return productData;
  }

  /**
   * Cria um novo produto
   * @param {Object} productData - Dados do produto
   * @param {string} userId - ID do usuário proprietário
   * @returns {Object} - Produto criado
   */
  static async createProduct(productData, userId) {
    const {
      title,
      description,
      category,
      price,
      monthlyPrice,
      condition,
      location,
      address,
      cep,
      images,
      availability = true
    } = productData;

    // Validar dados obrigatórios
    if (!title || !category || !price) {
      throw new Error('Título, categoria e preço são obrigatórios');
    }

    // Preparar location (PostGIS Point) se fornecido
    let locationPoint = null;
    if (location && location.lng && location.lat) {
      // Formato: { lng: -46.6333, lat: -23.5505 }
      locationPoint = sequelize.fn('ST_MakePoint', location.lng, location.lat);
    }

    // Processar imagens: garantir que seja um array válido
    let processedImages = [];
    if (images) {
      if (Array.isArray(images)) {
        // Filtrar apenas strings válidas (URLs)
        processedImages = images.filter(img => 
          typeof img === 'string' && img.trim().length > 0
        );
      } else if (typeof images === 'string') {
        // Se for string única, converter para array
        processedImages = [images.trim()].filter(img => img.length > 0);
      }
    }

    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      console.log('📸 Imagens recebidas:', {
        original: images,
        processed: processedImages,
        count: processedImages.length
      });
    }

    const product = await Product.create({
      userId,
      title,
      description,
      category,
      price,
      monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
      condition: condition || 'good',
      location: locationPoint,
      address,
      cep,
      images: processedImages,
      availability
    });

    return await this.getProductById(product.id);
  }

  /**
   * Atualiza um produto
   * @param {string} productId - ID do produto
   * @param {Object} productData - Dados a serem atualizados
   * @param {string} userId - ID do usuário (para verificar propriedade)
   * @returns {Object} - Produto atualizado
   */
  static async updateProduct(productId, productData, userId) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se o usuário é o proprietário
    if (product.userId !== userId) {
      throw new Error('Você não tem permissão para atualizar este produto');
    }

    // Preparar location se fornecido
    if (productData.location && productData.location.lng && productData.location.lat) {
      productData.location = sequelize.fn('ST_MakePoint', productData.location.lng, productData.location.lat);
    }

    // Processar monthlyPrice se fornecido
    if (productData.monthlyPrice !== undefined) {
      productData.monthlyPrice = productData.monthlyPrice ? parseFloat(productData.monthlyPrice) : null;
    }

    await product.update(productData);

    return await this.getProductById(productId);
  }

  /**
   * Deleta um produto
   * @param {string} productId - ID do produto
   * @param {string} userId - ID do usuário (para verificar propriedade)
   */
  static async deleteProduct(productId, userId) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se o usuário é o proprietário
    if (product.userId !== userId) {
      throw new Error('Você não tem permissão para deletar este produto');
    }

    await product.destroy();
  }
}

module.exports = ProductService;

