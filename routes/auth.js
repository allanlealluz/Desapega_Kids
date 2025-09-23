import express from "express";
import { auth, db } from "../firebase-admin.js"; // Firebase Admin inicializado
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * 📌 POST /api/auth/register
 * Recebe idToken, email, nome e uid do front (já criado via Firebase Client SDK)
 * Verifica o token no Firebase Admin e salva dados adicionais no Firestore
 */
router.post("/register", async (req, res) => {
  const { idToken, email, displayName, uid } = req.body;

  try {
    // Verifica o token no Firebase Admin
    const decodedToken = await auth.verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      return res.status(401).json({ error: "UID inválido" });
    }

    // Salva dados adicionais do usuário no Firestore
    await db.collection("users").doc(uid).set({
      email,
      displayName,
      createdAt: new Date(),
    });

    req.session.user = { uid, email, displayName }; // cria sessão

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 📌 POST /api/auth/login
 * Recebe idToken do front, valida no Admin SDK e cria sessão
 */
router.post("/login", async (req, res) => {
  const { idToken, email, displayName, uid } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);

    if (decodedToken.uid !== uid) {
      return res.status(401).json({ error: "UID inválido" });
    }

    // Pega dados do Firestore (caso queira carregar perfil)
    const userDoc = await db.collection("users").doc(uid).get();
    let userData = userDoc.exists ? userDoc.data() : { email, displayName };

    req.session.user = { uid, ...userData };

    res.json({ message: "Login bem-sucedido", user: req.session.user });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * 📌 POST /api/auth/logout
 * Destroi a sessão do usuário
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao encerrar sessão:", err);
      return res.status(500).json({ error: "Erro ao encerrar sessão" });
    }
    res.json({ message: "Logout realizado com sucesso" });
  });
});

export default router;