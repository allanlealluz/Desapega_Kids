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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})