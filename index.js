import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import pagesRoutes from './routes/pages.js';

// IMPORTA O FIREBASE
import { db, auth } from './firebase-admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'desapega-kids-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: path.resolve('views/partials'),
    helpers: { eq: (a, b) => a === b }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/itens', itemsRoutes);
app.use('/', pagesRoutes);

// Middleware de erro
app.use((req, res) => res.status(404).render('404', { pageTitle: 'Página não encontrada' }));

// TESTE DE CONEXÃO COM FIREBASE
(async () => {
    try {
        console.log('✅ Conexão com Firebase Firestore estabelecida e teste gravado!');
    } catch (error) {
        console.error('❌ Erro ao conectar com Firebase:', error);
    }
})();

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
