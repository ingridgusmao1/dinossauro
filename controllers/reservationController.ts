import { Request, Response } from "express";
import { validationResult, body, ValidationChain } from "express-validator";
import { ReservationModel, CreateReservationData, Reservation, UpdateReservationData } from "../models/reservationModel";
import { TicketModel, Ticket } from "../models/ticketModel";

export class ReservationController {
  static async showReservationForm(_req: Request, res: Response): Promise<void> {
    try {
      const tickets: Ticket[] = await TicketModel.getAllTickets();
      
      const dinosaurList = [
        "velociraptor",
        "tyrannosaurus", 
        "pterosaurus",
        "therizinosaurus",
        "triceratops",
        "plesiossauros"
      ];

      const today = new Date().toISOString().split("T")[0];
      
      res.render("reservation-form", {
        title: "Réservation - JuraShow",
        tickets,
        dinosaurList,
        minDate: today,
        errors: null,
        oldData: null
      });

    } catch (error) {
      console.error("Erro ao carregar formulário de reserva:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Erreur lors du chargement du formulaire"
      });
    }
  }

  static validateReservation(): ValidationChain[] {
    return [
      body("name_buyer")
        .notEmpty()
        .withMessage("Le nom est requis")
        .isLength({ min: 2, max: 100 })
        .withMessage("Le nom doit avoir entre 2 et 100 caractères")
        .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
        .withMessage("Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes")
        .trim(),

      body("buyer_email")
        .notEmpty()
        .withMessage("L'email est requis")
        .isEmail()
        .withMessage("Format d'email invalide")
        .normalizeEmail(),

      body("phone")
        .optional()
        .isLength({ min: 10 })
        .withMessage("Le téléphone doit avoir au moins 10 caractères")
        .trim(),

      body("dinosaur")
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage("Le dinosaure doit être valide"),

      body("ticket_id")
        .notEmpty()
        .withMessage("Le type de billet est requis")
        .isInt({ min: 1 })
        .withMessage("ID de billet invalide"),

      body("quantity")
        .notEmpty()
        .withMessage("La quantité est requise")
        .isInt({ min: 1, max: 10 })
        .withMessage("La quantité doit être entre 1 et 10"),

      body("payment")
        .notEmpty()
        .withMessage("Le mode de paiement est requis")
        .isIn(["carte_credit", "paypal", "virement", "especes"])
        .withMessage("Mode de paiement invalide"),

      body("date")
        .notEmpty()
        .withMessage("La date est requise")
        .isISO8601()
        .withMessage("Format de date invalide")
        .custom((value: string) => {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            throw new Error("La date ne peut pas être dans le passé");
          }
          return true;
        })
    ];
  }

  static async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const tickets: Ticket[] = await TicketModel.getAllTickets();
        const dinosaurList = [
          "velociraptor", "tyrannosaurus", "pterosaurus",
          "therizinosaurus", "triceratops", "plesiossauros"
        ];
        const today = new Date().toISOString().split("T")[0];
        
        res.status(400).render("reservation-form", {
          title: "Réservation - JuraShow",
          tickets,
          dinosaurList,
          minDate: today,
          errors: errors.array(),
          oldData: req.body
        });
        return;
      }

      const { name_buyer, buyer_email, phone, dinosaur, ticket_id, quantity, payment, date } = req.body;

      const ticket: Ticket | null = await TicketModel.getTicketById(parseInt(ticket_id));
      if (!ticket) {
        res.status(404).render("error", {
          title: "Erreur",
          message: "Billet non trouvé"
        });
        return;
      }

      const isDateAvailable = await ReservationModel.isDateAvailable(date, parseInt(ticket_id));
      if (!isDateAvailable) {
        const tickets: Ticket[] = await TicketModel.getAllTickets();
        const dinosaurList = [
          "velociraptor", "tyrannosaurus", "pterosaurus",
          "therizinosaurus", "triceratops", "plesiossauros"
        ];
        const today = new Date().toISOString().split("T")[0];
        
        res.status(400).render("reservation-form", {
          title: "Réservation - JuraShow",
          tickets,
          dinosaurList,
          minDate: today,
          errors: [{ msg: "Cette date n'est pas disponible ou est complète" }],
          oldData: req.body
        });
        return;
      }

      const totalPrice = ticket.price * parseInt(quantity);

      const reservationData: CreateReservationData = {
        name_buyer: name_buyer.trim(),
        buyer_email: buyer_email.trim(),
        date: date, 
        quantity: parseInt(quantity),
        ticket_id: parseInt(ticket_id),
        total_price: totalPrice,
        payment: payment 
      };

      const reservationId = await ReservationModel.createReservation(reservationData);

      const reservation: Reservation | null = await ReservationModel.getReservationById(reservationId);
      
      res.render("reservation-success", {
        title: "Réservation Confirmée - JuraShow",
        reservationId,
        reservation: reservation ? {
          ...reservationData,
          reservation_id: reservationId,
          phone: phone || "",
          dinosaur: dinosaur || ticket.dinossaur,
          date: new Date(date)
        } : {
          ...reservationData,
          reservation_id: reservationId,
          phone: phone || "",
          dinosaur: dinosaur || ticket.dinossaur
        },
        ticket,
        totalPrice
      });

    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Erreur lors de la création de la réservation"
      });
    }
  }

  static async showSuccessPage(_req: Request, res: Response): Promise<void> {
    try {
      res.render("reservation-success", {
        title: "Réservation réussie - JuraShow",
        message: "Votre réservation a été confirmée avec succès!",
        reservationId: null,
        reservation: null,
        ticket: null,
        totalPrice: 0
      });
    } catch (error) {
      console.error("Erro ao mostrar página de sucesso:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Erreur lors du chargement de la page de confirmation",
        error: process.env.NODE_ENV === "development" ? error : {}
      });
    }
  }

  static async getReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationId = parseInt(req.params.id!);
      
      if (isNaN(reservationId)) {
        res.status(400).json({
          success: false,
          message: "ID de réservation invalide"
        });
        return;
      }

      const reservation: Reservation | null = await ReservationModel.getReservationById(reservationId);
      
      if (!reservation) {
        res.status(404).json({
          success: false,
          message: "Réservation non trouvée"
        });
        return;
      }

      res.json({
        success: true,
        data: reservation
      });

    } catch (error) {
      console.error("Erro ao buscar reserva:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de la réservation"
      });
    }
  }

  static async getReservationsByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email;
      
      if (!email || !email.includes("@")) {
        res.status(400).json({
          success: false,
          message: "Email invalide"
        });
        return;
      }

      const reservations: Reservation[] = await ReservationModel.getReservationsByEmail(email);
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });

    } catch (error) {
      console.error("Erro ao buscar reservas por email:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des réservations"
      });
    }
  }

  static async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationId = parseInt(req.params.id!);
      
      if (isNaN(reservationId)) {
        res.status(400).json({
          success: false,
          message: "ID de réservation invalide"
        });
        return;
      }

      const success = await ReservationModel.deleteReservation(reservationId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: "Réservation non trouvée ou déjà annulée"
        });
        return;
      }

      res.json({
        success: true,
        message: "Réservation annulée avec succès",
        data: { reservation_id: reservationId }
      });

    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'annulation de la réservation"
      });
    }
  }

  static async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationId = parseInt(req.params.id!);
      const { name_buyer, buyer_email, date, quantity, payment } = req.body;
      
      if (isNaN(reservationId)) {
        res.status(400).json({
          success: false,
          message: "ID de réservation invalide"
        });
        return;
      }

      // Validar dados de entrada
      if (!name_buyer && !buyer_email && !date && quantity === undefined && !payment) {
        res.status(400).json({
          success: false,
          message: "Aucun champ à mettre à jour"
        });
        return;
      }

      // Buscar reserva atual para verificar existência
      const existingReservation: Reservation | null = await ReservationModel.getReservationById(reservationId);
      if (!existingReservation) {
        res.status(404).json({
          success: false,
          message: "Réservation non trouvée"
        });
        return;
      }

      // Preparar dados para update
      const updateData: Partial<UpdateReservationData> = {};
      
      if (name_buyer) updateData.name_buyer = name_buyer.trim();
      if (buyer_email) updateData.buyer_email = buyer_email.trim();
      if (date) updateData.date = date;
      if (quantity !== undefined) updateData.quantity = parseInt(quantity);
      if (payment) updateData.payment = payment;

      // Se a data foi alterada, verificar disponibilidade
      if (date && date !== existingReservation.date.toISOString().split("T")[0]) {
        const isDateAvailable = await ReservationModel.isDateAvailable(
          date, 
          existingReservation.ticket_id
        );
        if (!isDateAvailable) {
          res.status(400).json({
            success: false,
            message: "La nouvelle date n'est pas disponible"
          });
          return;
        }
        
        // Recalcular preço se a quantidade também mudou
        if (quantity !== undefined) {
          const ticket: Ticket | null = await TicketModel.getTicketById(existingReservation.ticket_id);
          if (ticket) {
            updateData.total_price = ticket.price * parseInt(quantity);
          }
        }
      }

      // Atualizar reserva usando o model
      const success = await ReservationModel.updateReservation(reservationId, updateData);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: "Erreur lors de la mise à jour"
        });
        return;
      }

      // Buscar dados atualizados
      const updatedReservation: Reservation | null = await ReservationModel.getReservationById(reservationId);

      res.json({
        success: true,
        message: "Réservation mise à jour avec succès",
        data: updatedReservation
      });

    } catch (error) {
      console.error("Erro ao atualizar reserva:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour de la réservation"
      });
    }
  }

  // Listar todas as reservas (Read - Admin)
  static async listAllReservations(_req: Request, res: Response): Promise<void> {
    try {
      // Usar método do model
      const reservations: Reservation[] = await ReservationModel.getAllReservations();
      
      res.json({
        success: true,
        data: reservations,
        count: reservations.length
      });

    } catch (error) {
      console.error("Erro ao listar reservas:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des réservations"
      });
    }
  }

  // Estatísticas de reservas (Read - Analytics)
  static async getReservationStats(_req: Request, res: Response): Promise<void> {
    try {
      // Usar método do model
      const stats: any[] = await ReservationModel.getReservationStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  }
}