import { Request, Response } from 'express';
import { TicketModel } from '../models/ticketModel';

export class HomeController {
  
  static async showHomePage(_req: Request, res: Response): Promise<void> {
    try {
      const tickets = await TicketModel.getAllTickets();
      
      const dinosaurList = [
        'velociraptor',
        'tyrannosaurus', 
        'pterosaurus',
        'therizinosaurus',
        'triceratops',
        'plesiossauros'
      ];

      res.render('index', {
        title: 'JuraShow - Monde des Dinosaures',
        dinosaurList,
        tickets
      });

    } catch (error) {
      console.error('Erro ao carregar página inicial:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Erreur lors du chargement de la page',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  }

  static async getDinosaurInfo(req: Request, res: Response): Promise<void> {
    try {
      const { dinosaur } = req.params;
      
      const tickets = await TicketModel.getTicketsByDinosaur(dinosaur!);
      
      if (tickets.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Dinosaure non trouvé'
        });
        return;
      }

      res.json({
        success: true,
        data: tickets
      });

    } catch (error) {
      console.error('Erro ao buscar informações do dinossauro:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des informations'
      });
    }
  }
}