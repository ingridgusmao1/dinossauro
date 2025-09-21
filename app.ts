import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import homeRoutes from './routes/homeRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

app.use('/', homeRoutes); 
app.use('/tickets', ticketRoutes); 
app.use('/reservations', reservationRoutes);

app.use((_req, res) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    message: 'La page que vous cherchez n\'existe pas',
    error: {}
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro na aplicação:', err);
  
  res.status(err.status || 500).render('error', {
    title: 'Erreur',
    message: err.message || 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;