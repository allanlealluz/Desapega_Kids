// middleware/auth.js
import { getAuth } from 'firebase-admin/auth';
import admin from '../firebase-admin.js';

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  next();
};