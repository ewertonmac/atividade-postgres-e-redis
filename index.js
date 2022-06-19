require('dotenv').config();
const express = require('express');
const {sincronizarPostgres} = require('./database/postgres')
const {conectRedis} = require('./database/redis')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const pessoaController = require('./controllers/PessoaController');

const port = process.env.PORT || 3000

app.use(express.json());

app.use('/', swaggerUi.serve)

app.get('/', swaggerUi.setup(swaggerDocument))

app.get('/pessoa', pessoaController.getPessoas);

app.post('/pessoa', pessoaController.addPessoa);

app.put('/pessoa', pessoaController.atualizarPessoa);

app.get('/pessoa/:email', pessoaController.getPessoa)

app.delete('/pessoa/:email', pessoaController.deletarPessoa);

app.listen(port, ()=>{
    sincronizarPostgres().then(response => console.log(response)).catch()
    conectRedis().then(response => console.log(response)).catch()
    console.log(`API rodando na porta ${port}`);
});