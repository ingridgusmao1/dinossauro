import { Router } from "express";
import { ReservationController } from "../controllers/reservationController.js";

const router = Router();

router.get("/", ReservationController.showReservationForm);

router.post("/", ReservationController.validateReservation(), ReservationController.createReservation);

router.get("/success", ReservationController.showSuccessPage);

router.get("/api/:id", ReservationController.getReservation);

router.get("/api/email/:email", ReservationController.getReservationsByEmail);

router.delete("/api/:id", ReservationController.cancelReservation);

router.put("/api/:id", ReservationController.validateReservation(), ReservationController.updateReservation);

router.get("/api/admin", ReservationController.listAllReservations);

router.get("/api/stats", ReservationController.getReservationStats);

export default router;