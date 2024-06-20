const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

let usuarios = [];
let produtos = [];
let moedas = {};

app.use(bodyParser.json());
app.use(express.static('public'));

// Endpoint para registrar usuários
app.post('/registrar', (req, res) => {
    const { email, senha, nome } = req.body;
    if (usuarios.find(usuario => usuario.nome === nome || usuario.email === email)) {
        return res.status(400).send('Usuário já existe');
    }
    usuarios.push({ email, senha, nome });
    moedas[nome] = 0;
    res.send('Usuário registrado com sucesso');
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { nome, senha } = req.body;
    const usuario = usuarios.find(usuario => usuario.nome === nome && usuario.senha === senha);
    if (usuario) {
        res.send('Login bem-sucedido');
    } else {
        res.status(400).send('Nome ou senha incorretos');
    }
});

// Endpoint para adicionar ao carrinho (somente em memória)
app.post('/adicionarAoCarrinho', (req, res) => {
    const { produto } = req.body;
    produtos.push(produto);
    res.send('Produto adicionado ao carrinho');
});

// Endpoint para finalizar a compra
app.post('/finalizarCompra', (req, res) => {
    const { nome, totalMoedas } = req.body;
    if (moedas[nome] >= totalMoedas) {
        moedas[nome] -= totalMoedas;
        res.send('Compra finalizada com sucesso');
    } else {
        res.status(400).send('Moedas insuficientes');
    }
});

// Endpoint para doar moedas
app.post('/doarMoedas', (req, res) => {
    const { nome, quantidade } = req.body;
    if (moedas[nome] !== undefined) {
        moedas[nome] += quantidade;
        res.send(`Doado ${quantidade} moedas para ${nome}`);
    } else {
        res.status(400).send('Usuário não encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
