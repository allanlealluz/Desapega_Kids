import { engine } from 'express-handlebars'; 
import bodyParser from 'body-parser';
import path from 'path'; 
import express from 'express'
import { fileURLToPath } from 'url';

// Criar __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('handlebars', engine({
    defaultLayout: 'main',
    partialsDir: path.resolve('views/partials'),
    helpers: { eq: (a, b) => a === b }
}));

app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.use("/img", express.static(path.join(__dirname, "/public/img")));

// Rota principal - apenas uma definição
app.get('/', function(req, res){
    res.render('home')
});
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API Routes para autenticação
app.post('/api/auth/login', async (req, res) => {
    try {
        const { idToken, email, displayName, photoURL, uid, provider } = req.body;
        
        // Salvar dados do usuário na sessão
        req.session.user = {
            uid,
            email,
            displayName,
            photoURL,
            provider: provider || 'email'
        };
        
        res.json({ success: true, message: 'Login realizado com sucesso!' });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { idToken, email, displayName, photoURL, uid, provider } = req.body;
        
        // Aqui você pode salvar o usuário no Firestore se necessário
        // Por exemplo: await db.collection('users').doc(uid).set({ ... })
        
        // Salvar dados do usuário na sessão
        req.session.user = {
            uid,
            email,
            displayName,
            photoURL,
            provider: provider || 'email',
            createdAt: new Date()
        };
        
        res.json({ success: true, message: 'Conta criada com sucesso!' });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})