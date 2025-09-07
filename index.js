import { engine } from 'express-handlebars'; 
import bodyParser from 'body-parser';
import path from 'path'; 
import express from 'express'
import session from 'express-session';
import { fileURLToPath } from 'url';

// Criar __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sessão
app.use(session({
    secret: 'desapega-kids-secret-key-2024', // Chave secreta para assinar cookies
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // true apenas para HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configurar view engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: path.resolve('views/partials'),
    helpers: { eq: (a, b) => a === b }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Configurar diretório das views

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use("/img", express.static(path.join(__dirname, "/public/img")));

// Middleware global para passar dados do usuário para as views
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// ========== ROTAS PRINCIPAIS ==========

// Rota principal
app.get('/', function(req, res){
    res.render('home');
});

// ========== ROTAS DE AUTENTICAÇÃO (GET) ==========

// Página de login
app.get('/login', (req, res) => {
    // Se já estiver logado, redirecionar para home
    if (req.session?.user) {
        return res.redirect('/');
    }
    res.render('login', { 
        layout: 'auth',
        pageTitle: 'Login'
    });
});

// Página de registro
app.get('/register', (req, res) => {
    // Se já estiver logado, redirecionar para home
    if (req.session?.user) {
        return res.redirect('/');
    }
    res.render('register', { 
        layout: 'auth',
        pageTitle: 'Cadastro'
    });
});

// ========== ROTAS DE AUTENTICAÇÃO (POST) ==========

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
        }
        res.redirect('/');
    });
});

// ========== API ROUTES PARA AUTENTICAÇÃO ==========

// API Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { idToken, email, displayName, photoURL, uid, provider } = req.body;
        
        // Validar dados obrigatórios
        if (!uid || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados de usuário inválidos' 
            });
        }
        
        // Salvar dados do usuário na sessão
        req.session.user = {
            uid,
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || null,
            provider: provider || 'email',
            loginAt: new Date()
        };
        
        console.log('Usuário logado:', req.session.user);
        
        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            user: req.session.user
        });
        
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// API Registro
app.post('/api/auth/register', async (req, res) => {
    try {
        const { idToken, email, displayName, photoURL, uid, provider } = req.body;
        
        // Validar dados obrigatórios
        if (!uid || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Dados de usuário inválidos' 
            });
        }
        
        // Aqui você pode salvar o usuário no Firestore se necessário
        // Exemplo:
        // import { db } from './firebase-config.js';
        // import { doc, setDoc } from 'firebase/firestore';
        // await setDoc(doc(db, 'users', uid), {
        //     email,
        //     displayName,
        //     photoURL,
        //     provider: provider || 'email',
        //     createdAt: new Date()
        // });
        
        // Salvar dados do usuário na sessão
        req.session.user = {
            uid,
            email,
            displayName: displayName || email.split('@')[0],
            photoURL: photoURL || null,
            provider: provider || 'email',
            createdAt: new Date()
        };
        
        console.log('Novo usuário registrado:', req.session.user);
        
        res.json({ 
            success: true, 
            message: 'Conta criada com sucesso!',
            user: req.session.user
        });
        
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========

// Middleware para rotas que precisam de autenticação
function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.redirect('/login');
    }
    next();
}

// ========== ROTAS PROTEGIDAS ==========

// Exemplo de rotas que precisam de autenticação
app.get('/perfil', requireAuth, (req, res) => {
    res.render('perfil', {
        pageTitle: 'Meu Perfil',
        user: req.session.user
    });
});

app.get('/doar', requireAuth, (req, res) => {
    res.render('doar', {
        pageTitle: 'Doar Item',
        user: req.session.user
    });
});

app.get('/meus-itens', requireAuth, (req, res) => {
    res.render('meus-itens', {
        pageTitle: 'Meus Itens',
        user: req.session.user
    });
});

// ========== ROTAS PÚBLICAS ADICIONAIS ==========

app.get('/categorias', (req, res) => {
    res.render('categorias', {
        pageTitle: 'Categorias'
    });
});

app.get('/como-funciona', (req, res) => {
    res.render('como-funciona', {
        pageTitle: 'Como Funciona'
    });
});

app.get('/sobre', (req, res) => {
    res.render('sobre', {
        pageTitle: 'Sobre'
    });
});

// ========== TRATAMENTO DE ERROS ==========

// 404 - Página não encontrada
app.use((req, res) => {
    res.status(404).render('404', {
        pageTitle: 'Página não encontrada',
        layout: 'main'
    });
});

// Tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro no servidor:', error);
    res.status(500).render('500', {
        pageTitle: 'Erro interno',
        layout: 'main'
    });
});

// ========== INICIAR SERVIDOR ==========

app.listen(port, () => {
    console.log(`🚀 Desapega Kids rodando em http://localhost:${port}`);
    console.log(`📱 Acesse as páginas:`);
    console.log(`   • Home: http://localhost:${port}/`);
    console.log(`   • Login: http://localhost:${port}/login`);
    console.log(`   • Registro: http://localhost:${port}/register`);
});