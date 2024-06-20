// models/usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    nome: { type: String, required: true },
    moedasFivem: { type: Number, default: 0 }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
