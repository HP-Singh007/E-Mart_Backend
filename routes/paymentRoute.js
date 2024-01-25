import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js';
import { processPayment, sendApiKey } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/process',isAuthenticated,processPayment);
router.get('/getkey',isAuthenticated,sendApiKey);

export default router;