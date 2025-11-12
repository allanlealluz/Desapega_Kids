import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

// Caminho absoluto para o arquivo de serviço
const serviceAccountPath = path.resolve('./firebase-service-account.json');

// Lê e converte o JSON
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Pega o ID do projeto do service account (necessário para o storage)
const projectId = serviceAccount.project_id;

// Inicializa o Firebase Admin (só inicializa uma vez)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://desapegakids-6e481-default-rtdb.firebaseio.com",

    // ✅ LINHA ADICIONADA:
    // Aponta para o seu bucket do Firebase Storage.
    storageBucket: `${projectId}.appspot.com`
  });
}

// Exporta para usar em outros arquivos
export const db = admin.firestore();
export const auth = admin.auth();

// ✅ LINHA ADICIONADA:
// Exporta o serviço de Storage (para o upload de fotos)
export const storage = admin.storage().bucket();

export default admin;