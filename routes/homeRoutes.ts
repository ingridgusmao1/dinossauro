import { Router } from 'express';
import { HomeController } from '../controllers/homeController';

const router = Router();

router.get('/', HomeController.showHomePage);

router.get('/api/dinosaur/:dinosaur', HomeController.getDinosaurInfo);

export default router;