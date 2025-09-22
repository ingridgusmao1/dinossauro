import { query } from './Database';

export interface UpdateReservationData {
  name_buyer?: string;
  buyer_email?: string;
  date?: string;
  quantity?: number;
  total_price?: number;
  payment?: string;
}

interface RawReservationRow {
  user_id: number;
  reservation_id: number;
  name_buyer: string;
  buyer_email: string;
  date: string | Date;
  quantity: number;
  ticket_id: number;
  total_price: number;
  payment: string;
  dinossaur?: string | null;
  ticket_description?: string | null;
}

export interface Reservation {
  user_id: number;
  reservation_id: number;
  name_buyer: string;
  buyer_email: string;
  date: Date;
  quantity: number;
  ticket_id: number;
  total_price: number;
  payment: string;
  dinossaur?: string;
  ticket_description?: string;
}

export interface CreateReservationData {
  name_buyer: string;
  buyer_email: string;
  date: string;
  quantity: number;
  ticket_id: number;
  total_price: number;
  payment: string;
}

export class ReservationModel {
  static async createReservation(data: CreateReservationData): Promise<number> {
    try {
      const userId = Math.floor(Math.random() * 1000000);
      const reservationId = Math.floor(Math.random() * 1000000);

      const result = await query(`
        INSERT INTO reservation (
          user_id, reservation_id, name_buyer, buyer_email, 
          date, quantity, ticket_id, total_price, payment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING reservation_id
      `, [
        userId,
        reservationId,
        data.name_buyer,
        data.buyer_email,
        data.date,
        data.quantity,
        data.ticket_id,
        data.total_price,
        data.payment
      ]);

      if (!result || !result.rows || result.rows.length === 0) {
        throw new Error("Aucune réservation créée");
      }

      return result.rows[0].reservation_id;
    } catch (error) {
      console.error("Erreur", error);
      throw new Error("Erreur");
    }
  }

  static async getReservationById(reservationId: number): Promise<Reservation | null> {
    try {
      const result = await query(`
        SELECT r.*, dt.dinossaur, dt.description as ticket_description
        FROM reservation r
        LEFT JOIN dinoussaur_ticket dt ON r.ticket_id = dt.ticket_id
        WHERE r.reservation_id = $1
      `, [reservationId]);

      if (!result || !result.rows) return null;
      
      const row = result.rows[0];
      if (!row) return null;

      return this.normalizeReservationRow(row);
    } catch (error) {
      console.error("Erreur", error);
      return null;
    }
  }

  private static normalizeReservationRow(row: RawReservationRow): Reservation {
    const date = typeof row.date === "string" ? new Date(row.date) : row.date;
    
    return {
      user_id: row.user_id,
      reservation_id: row.reservation_id,
      name_buyer: row.name_buyer || "",
      buyer_email: row.buyer_email || "",
      date: date,
      quantity: row.quantity || 0,
      ticket_id: row.ticket_id || 0,
      total_price: row.total_price || 0,
      payment: row.payment || "",
      dinossaur: row.dinossaur || undefined,
      ticket_description: row.ticket_description || undefined
    };
  }

  static async getReservationsByEmail(email: string): Promise<Reservation[]> {
    try {
      const result = await query(`
        SELECT r.*, dt.dinossaur, dt.description as ticket_description
        FROM reservation r
        LEFT JOIN dinoussaur_ticket dt ON r.ticket_id = dt.ticket_id
        WHERE LOWER(r.buyer_email) = LOWER($1)
        ORDER BY r.date DESC
      `, [email]);

      if (!result || !result.rows) return [];
      
      return result.rows.map((row: RawReservationRow) => this.normalizeReservationRow(row));
    } catch (error) {
      console.error("Erreur:", error);
      return [];
    }
  }

  static async isDateAvailable(date: string, ticketId: number): Promise<boolean> {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      if (date < today) {
        return false;
      }

      const result = await query(`
        SELECT COALESCE(SUM(quantity), 0) as total_reservations
        FROM reservation
        WHERE date = $1 AND ticket_id = $2
      `, [date, ticketId]);

      const totalReservations = parseInt(result?.rows[0]?.total_reservations?.toString() || "0");
      const maxCapacity = 100; 

      return totalReservations < maxCapacity;
    } catch (error) {
      console.error("Erreur", error);
      return true; 
    }
  }

  static async updateReservation(reservationId: number, data: UpdateReservationData): Promise<boolean> {
    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (data.name_buyer !== undefined) {
        updates.push(`name_buyer = $${paramIndex}`);
        values.push(data.name_buyer);
        paramIndex++;
      }
      
      if (data.buyer_email !== undefined) {
        updates.push(`buyer_email = $${paramIndex}`);
        values.push(data.buyer_email);
        paramIndex++;
      }
      
      if (data.date !== undefined) {
        updates.push(`date = $${paramIndex}`);
        values.push(data.date);
        paramIndex++;
      }
      
      if (data.quantity !== undefined) {
        updates.push(`quantity = $${paramIndex}`);
        values.push(data.quantity);
        paramIndex++;
      }
      
      if (data.total_price !== undefined) {
        updates.push(`total_price = $${paramIndex}`);
        values.push(data.total_price);
        paramIndex++;
      }
      
      if (data.payment !== undefined) {
        updates.push(`payment = $${paramIndex}`);
        values.push(data.payment);
        paramIndex++;
      }

      if (updates.length === 0) {
        return false; 
      }

      updates.push(`WHERE reservation_id = $${paramIndex}`);
      values.push(reservationId);

      const queryText = `UPDATE reservation SET ${updates.join(", ")} RETURNING reservation_id`;
      
      const result = await query(queryText, values);
      
      return result && result.rows && result.rows.length > 0;
    } catch (error) {
      console.error("Erreur", error);
      return false;
    }
  }

  static async deleteReservation(reservationId: number): Promise<boolean> {
    try {
      const result = await query(`
        DELETE FROM reservation 
        WHERE reservation_id = $1
        RETURNING reservation_id
      `, [reservationId]);

      return result && result.rows && result.rows.length > 0;
    } catch (error) {
      console.error("Erreur", error);
      return false;
    }
  }

  static async getAllReservations(): Promise<Reservation[]> {
    try {
      const result = await query(`
        SELECT r.*, dt.dinossaur, dt.description as ticket_description
        FROM reservation r
        LEFT JOIN dinoussaur_ticket dt ON r.ticket_id = dt.ticket_id
        ORDER BY r.date DESC, r.reservation_id DESC
      `);

      if (!result || !result.rows) return [];
      
      return result.rows.map((row: RawReservationRow) => this.normalizeReservationRow(row));
    } catch (error) {
      console.error("Erreur", error);
      return [];
    }
  }

  static async getReservationStats(): Promise<any[]> {
    try {
      const result = await query(`
        SELECT 
          DATE_TRUNC("month", date) as month,
          COUNT(*) as total_reservations,
          COALESCE(SUM(total_price), 0) as total_revenue,
          COALESCE(SUM(quantity), 0) as total_tickets,
          AVG(total_price) as average_revenue
        FROM reservation 
        WHERE date >= CURRENT_DATE - INTERVAL "1 year"
        GROUP BY DATE_TRUNC("month", date)
        ORDER BY month DESC
      `);

      if (!result || !result.rows) return [];
      return result.rows;
    } catch (error) {
      console.error("Erreur", error);
      return [];
    }
  }
}