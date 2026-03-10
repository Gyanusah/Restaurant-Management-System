import express from 'express';
import { signup, login, customerLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/customer/login', customerLogin);

export default router;
