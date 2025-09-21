import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';

const router = Router();

router.get('/', TicketController.showTicketsPage);

router.get('/api/:id', TicketController.getTicketDetails);

router.get('/api', TicketController.validateTicketSearch, TicketController.searchTickets);

router.get('/api/:id/availability', TicketController.checkAvailability);

export default router;