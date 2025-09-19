import express from 'express';
import { db } from '../firebase-admin.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
   // cadastrar item
});

router.get('/', async (req, res) => {
   // listar itens
});

router.put('/:id', requireAuth, async (req, res) => {
   // editar item
});

router.delete('/:id', requireAuth, async (req, res) => {
   // deletar item
});

export default router;
