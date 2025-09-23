import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
   res.render('home', { pageTitle: 'Desapega Kids' });
});

router.get('/login', (req, res) => {
   res.render('login', { layout: 'auth', pageTitle: 'Login' });
});

router.get('/register', (req, res) => {
   res.render('register', { layout: 'auth', pageTitle: 'register' });
});

export default router;
