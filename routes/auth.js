import express from 'express';
// Assumindo que seu arquivo firebase-admin.js exporta o 'auth' e o 'db' inicializados
import { auth, db } from '../firebase-admin.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { idToken, uid, email, displayName, photoURL, provider } = req.body;

        // 1. Verificar o token com o Firebase Admin SDK (passo de segurança crucial)
        const decodedToken = await auth.verifyIdToken(idToken);
        if (decodedToken.uid !== uid) {
            return res.status(401).json({ success: false, message: 'Token inválido ou não autorizado.' });
        }

        // 2. Sincronizar dados no Firebase Auth (especialmente o nome para cadastros via email)
        // O usuário já existe, então usamos updateUser para garantir que os dados estão corretos.
        await auth.updateUser(uid, {
            displayName: displayName,
            photoURL: photoURL || null
        });

        // 3. Salvar/Atualizar perfil no Firestore
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.set({
            email,
            displayName,
            photoURL: photoURL || null,
            provider: provider || 'email', // Define 'email' como padrão
            createdAt: new Date(),
        }, { merge: true }); // 'merge: true' evita sobrescrever dados existentes

        // 4. ✅ ESSENCIAL: Criar a sessão no servidor para o usuário
        req.session.user = {
            uid: uid,
            email: email,
            displayName: displayName,
            photoURL: photoURL || null
        };
        
        // 5. Enviar resposta de sucesso para o frontend
        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error('Erro no registro do backend:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// Suas outras rotas (login, logout) continuam aqui...
router.get('/login', (req, res) => { /* ... */ });
router.post('/logout', (req, res) => { /* ... */ });

export default router;