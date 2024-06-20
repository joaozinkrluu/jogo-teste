// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/servidor-fivem'; // URL de conexão com o MongoDB

app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rota para registrar um novo usuário
app.post('/registrar', async (req, res) => {
    const { email, senha, nome } = req.body;
    try {
        const usuario = await Usuario.create({ email, senha, nome });
        res.status(201).send('Usuário registrado com sucesso');
    } catch (err) {
        res.status(400).send('Erro ao registrar usuário');
    }
});

// Rota para realizar login
app.post('/login', async (req, res) => {
    const { nome, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ nome, senha });
        if (usuario) {
            res.send('Login bem-sucedido');
        } else {
            res.status(400).send('Nome ou senha incorretos');
        }
    } catch (err) {
        res.status(500).send('Erro ao realizar login');
    }
});

// Rota para doar moedas
app.post('/doarMoedas', async (req, res) => {
    const { nome, quantidade } = req.body;
    try {
        const usuario = await Usuario.findOne({ nome });
        if (usuario) {
            // Atualizar a quantidade de moedas do usuário no banco de dados
            usuario.moedasFivem += parseInt(quantidade);
            await usuario.save();
            res.send(`Doado ${quantidade} moedas para ${nome}`);
        } else {
            res.status(400).send('Usuário não encontrado');
        }
    } catch (err) {
        res.status(500).send('Erro ao doar moedas');
    }
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
