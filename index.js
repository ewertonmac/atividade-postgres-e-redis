require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
const {sincronizarPostgres} = require('./database/postgres')
const {conectRedis} = require('./database/redis')
const pessoaController = require('./controllers/PessoaController');

const port = process.env.PORT || 3000

app.get('/pessoas', pessoaController.getPessoas);

app.post('/pessoas', pessoaController.addPessoa);

app.get('/pessoa/:email', pessoaController.getPessoa)

app.delete('/pessoa/:email', pessoaController.deletarPessoa);

app.put('/pessoa', pessoaController.atualizarPessoa);

app.listen(port, ()=>{
    sincronizarPostgres().then(response => console.log(response)).catch()
    conectRedis().then(response => console.log(response)).catch()
    console.log(`API rodando na porta ${port}`);
});