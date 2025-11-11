import express from "express";
import { auth, db } from "../firebase-admin.js";

const router = express.Router();

/**
 * 📌 POST /api/auth/login
 * Recebe idToken, valida no Firebase Admin e cria sessão Express
 */
router.post("/login", async (req, res) => {
  const { idToken, email, displayName, uid } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.uid !== uid) {
      return res.status(401).json({ error: "UID inválido" });
    }

    const userDoc = await db.collection("users").doc(uid).get();
    
    // Fallback para dados do token se o doc não existir
    const userData = userDoc.exists ? userDoc.data() : { email, displayName };

    // Tente pegar a photoURL do Firestore, se não, pegue do token
    const photoURL = userData.photoURL || decodedToken.picture || null;

    // Cria a sessão
    req.session.user = {
      uid,
      email: userData.email || email,
      displayName: userData.displayName || displayName,
      photoURL: photoURL,
      loginTime: new Date(),
    };

    console.log(`✅ Sessão criada para ${email} (login)`);

    res.json({
      message: "Login bem-sucedido",
      user: req.session.user,
    });
  } catch (error) {
    console.error("❌ Erro no login:", error);
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

    res.clearCookie("connect.sid");
    res.json({ message: "Logout realizado com sucesso" });
  });
});

/**
 * 📌 GET /api/auth/me
 * Verifica se o usuário possui sessão ativa
 */
router.get("/me", (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  } else {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }
});

/**
 * 📌 POST /api/auth/update
 * Atualiza nome e foto do usuário logado
 */
router.post("/update", async (req, res) => {
  const { idToken, displayName, uid, photoBase64 } = req.body;

  try {
    const decoded = await auth.verifyIdToken(idToken);
    if (decoded.uid !== uid) {
      return res.status(401).json({ error: "UID inválido" });
    }

    // Preparar dados para atualização
    const updateData = {
      displayName,
      updatedAt: new Date(),
    };

    // Se enviou uma foto Base64, adicionar ao objeto de atualização
    if (photoBase64) {
      updateData.photoURL = photoBase64; // Salvando Base64 diretamente
    }

    // Atualiza no Firestore
    await db.collection("users").doc(uid).set(updateData, { merge: true });

    // Atualiza sessão Express
    if (req.session.user) {
      req.session.user.displayName = displayName;
      if (photoBase64) {
        req.session.user.photoURL = photoBase64;
      }
    }

    console.log(`✅ Perfil atualizado: ${displayName}${photoBase64 ? ' (com foto)' : ''}`);
    
    // Retornar a photoURL na resposta (importante para o frontend atualizar)
    res.json({ 
      success: true,
      message: "Perfil atualizado com sucesso",
      photoURL: photoBase64 || req.session.user?.photoURL
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;