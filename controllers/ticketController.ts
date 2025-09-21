import { Request, Response } from 'express';
import { validationResult, body } from 'express-validator';
import { TicketModel } from '../models/ticketModel.js';

export class TicketController {

  static async showTicketsPage(req: Request, res: Response): Promise<void> {
    try {
      const tickets = await TicketModel.getAllTickets();
      
      res.render('tickets', {
        title: 'Billets - JuraShow',
        tickets,
        selectedDinosaur: req.query.dinosaur || null
      });

    } catch (error) {
      console.error('Erro ao carregar página de ingressos:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Erreur lors du chargement des billets',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  static async getTicketDetails(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        res.status(400).json({
          success: false,
          message: 'ID de billet invalide'
        });
        return;
      }

      const ticket = await TicketModel.getTicketById(ticketId);
      
      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Billet non trouvé'
        });
        return;
      }

      res.json({
        success: true,
        data: ticket
      });

    } catch (error) {
      console.error('Erro ao buscar detalhes do ingresso:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du billet'
      });
    }
  }

  static validateTicketSearch = [
    body('dinosaur')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Nom du dinosaure invalide')
      .trim()
      .escape(),
    
    body('type')
      .optional()
      .isIn(['adulte', 'enfant', 'senior', 'groupe'])
      .withMessage('Type de billet invalide')
  ];

  static async searchTickets(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array()
        });
        return;
      }

      const { dinosaur, type } = req.query;
      let tickets;

      if (dinosaur) {
        tickets = await TicketModel.getTicketsByDinosaur(dinosaur as string);
      } else {
        tickets = await TicketModel.getAllTickets();
      }

      if (type) {
        tickets = tickets.filter(ticket => 
          (ticket.type || '').toString().toLowerCase() === (type as string).toLowerCase()
        );
      }

      res.json({
        success: true,
        data: tickets,
        count: tickets.length
      });

    } catch (error) {
      console.error('Erro na busca de ingressos:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche'
      });
    }
  }

  static async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      
      if (isNaN(ticketId)) {
        res.status(400).json({
          success: false,
          message: 'ID de billet invalide'
        });
        return;
      }

      const isAvailable = await TicketModel.isTicketAvailable(ticketId);
      
      res.json({
        success: true,
        available: isAvailable
      });

    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification de disponibilité'
      });
    }
  }
}