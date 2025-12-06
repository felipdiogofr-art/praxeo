const express = require('express');
const router = express.Router();
const ReservationController = require('../controllers/reservation.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

/**
 * Rotas de Reservas
 * Base: /api/reservations
 */

// POST /api/reservations - Criar reserva (autenticado)
router.post('/', authenticate, ReservationController.createReservation);

// GET /api/reservations - Listar reservas do usuário (autenticado)
router.get('/', authenticate, ReservationController.getReservations);

// GET /api/reservations/:id - Detalhes da reserva (autenticação opcional para verificação de permissão)
router.get('/:id', optionalAuthenticate, ReservationController.getReservationById);

// PUT /api/reservations/:id/status - Atualizar status da reserva (autenticado)
router.put('/:id/status', authenticate, ReservationController.updateReservationStatus);

module.exports = router;

