import { query } from './Database';

interface RawTicketRow {
  ticket_id: number;
  dinossaur: string;
  description: string;
  type?: string;
  price: number | string;
}

export interface Ticket {
  id: number;
  ticket_id: number;
  dinossaur: string;
  dinosaur: string; 
  type: string;
  name: string; 
  price: number;
  description: string;
}

export class TicketModel {
  
  private static normalizeTicketRow(row: RawTicketRow): Ticket {
    const dinoName = row.dinossaur || "tyrannosaurus";
    const type = row.type || "adulte";
    const generatedName = `Billet ${type === "enfant" ? "Enfant" : "Adulte"} - ${this.formatDinosaurName(dinoName)}`;
    
    return {
      id: row.ticket_id || 0,
      ticket_id: row.ticket_id || 0,
      dinossaur: dinoName,
      dinosaur: dinoName, 
      type: type,
      name: generatedName,
      price: this.parsePrice(row.price),
      description: row.description || "Découvrez cette attraction avec JuraShow !"
    };
  }

  private static formatDinosaurName(dinossaur: string): string {
    const dinoLower = dinossaur.toLowerCase();
    switch(dinoLower) {
      case "velociraptor": return "Vélociraptor";
      case "tyrannosaurus": return "Tyrannosaure";
      case "pterosaurus": return "Ptérosaure";
      case "therizinosaurus": return "Thérizinosaure";
      case "triceratops": return "Tricératops";
      case "plesiossauros": return "Plésiosaure";
      default: return dinossaur.charAt(0).toUpperCase() + dinossaur.slice(1);
    }
  }

  private static getFallbackTickets(): Ticket[] {
    return [
      {
        id: 1,
        ticket_id: 1,
        dinossaur: "tyrannosaurus",
        dinosaur: "tyrannosaurus",
        type: "adulte",
        name: "Billet Adulte - Tyrannosaure",
        price: 30.00,
        description: "Découvrez le roi des dinosaures dans une expérience immersive et terrifiante !"
      },
      {
        id: 2,
        ticket_id: 2,
        dinossaur: "tyrannosaurus",
        dinosaur: "tyrannosaurus",
        type: "enfant",
        name: "Billet Enfant - Tyrannosaure",
        price: 22.00,
        description: "Une aventure palpitante pour les petits courageux !"
      },
      {
        id: 3,
        ticket_id: 3,
        dinossaur: "triceratops",
        dinosaur: "triceratops",
        type: "adulte",
        name: "Billet Adulte - Tricératops",
        price: 24.00,
        description: "Rencontrez le géant herbivore à trois cornes dans son habitat naturel !"
      },
      {
        id: 4,
        ticket_id: 4,
        dinossaur: "triceratops",
        dinosaur: "triceratops",
        type: "enfant",
        name: "Billet Enfant - Tricératops",
        price: 17.00,
        description: "Une rencontre éducative avec le dinosaure emblématique !"
      },
      {
        id: 5,
        ticket_id: 5,
        dinossaur: "velociraptor",
        dinosaur: "velociraptor",
        type: "adulte",
        name: "Billet Adulte - Vélociraptor",
        price: 25.00,
        description: "Vivez la vitesse et l'intelligence du chasseur le plus redoutable !"
      },
      {
        id: 6,
        ticket_id: 6,
        dinossaur: "velociraptor",
        dinosaur: "velociraptor",
        type: "enfant",
        name: "Billet Enfant - Vélociraptor",
        price: 18.00,
        description: "Apprenez à connaître ces chasseurs agiles du Crétacé !"
      }
    ];
  }

  private static parsePrice(price: number | string | null | undefined): number {
    if (price === null || price === undefined || price === "") return 0;
    if (typeof price === "number") return price;
    if (typeof price === "string") {
      const cleanedPrice = price.replace(/[^\d.,]/g, "").replace(",", ".");
      const parsed = parseFloat(cleanedPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  static async getAllTickets(): Promise<Ticket[]> {
    try {
      const result = await query(`
        SELECT ticket_id, dinossaur, description, type, price
        FROM dinoussaur_ticket
        ORDER BY dinossaur, type
      `);

      if (result && result.rows && result.rows.length > 0) {
        return result.rows.map((row: RawTicketRow) => this.normalizeTicketRow(row));
      } else {
        console.warn("Aucune donnée de ticket trouvée dans la base, utilisation des données de fallback");
        return this.getFallbackTickets();
      }
    } catch (error) {
      console.error("Erreur", error);
      console.log("Utilisation des données de fallback pour les tickets");
      return this.getFallbackTickets();
    }
  }

  static async getTicketById(ticketId: number): Promise<Ticket | null> {
    try {
      const result = await query(`
        SELECT ticket_id, dinossaur, description, type, price
        FROM dinoussaur_ticket
        WHERE ticket_id = $1
      `, [ticketId]);

      if (!result || !result.rows || result.rows.length === 0) {
        const fallbackTickets = this.getFallbackTickets();
        const fallbackTicket = fallbackTickets.find(t => t.ticket_id === ticketId);
        return fallbackTicket || null;
      }

      const row: RawTicketRow = result.rows[0];
      return this.normalizeTicketRow(row);
    } catch (error) {
      console.error("Erro ao buscar ticket por ID:", error);
      const fallbackTickets = this.getFallbackTickets();
      return fallbackTickets.find(t => t.ticket_id === ticketId) || null;
    }
  }

  static async getTicketsByDinosaur(dinosaur: string): Promise<Ticket[]> {
    try {
      const result = await query(`
        SELECT ticket_id, dinossaur, description, type, price
        FROM dinoussaur_ticket
        WHERE LOWER(dinossaur) = LOWER($1)
        ORDER BY type
      `, [dinosaur]);

      if (result && result.rows && result.rows.length > 0) {
        return result.rows.map((row: RawTicketRow) => this.normalizeTicketRow(row));
      } else {
        const fallbackTickets = this.getFallbackTickets();
        return fallbackTickets.filter(ticket => 
          ticket.dinossaur.toLowerCase() === dinosaur.toLowerCase()
        );
      }
    } catch (error) {
      console.error("Erreur", error);
      const fallbackTickets = this.getFallbackTickets();
      return fallbackTickets.filter(ticket => 
        ticket.dinossaur.toLowerCase() === dinosaur.toLowerCase()
      );
    }
  }

  static async isTicketAvailable(ticketId: number): Promise<boolean> {
    try {
      const ticket = await this.getTicketById(ticketId);
      return !!ticket;
    } catch (error) {
      console.error("Erreur", error);
      return false;
    }
  }
}