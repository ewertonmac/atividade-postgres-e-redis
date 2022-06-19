const Pessoa = require('../models/pessoa');
const { redisInstance } = require('../database/redis')


const getPessoas = async (request, response) => {
    const pagina = request.query.pagina > 0 ? parseInt(request.query.pagina) : 1;
    const itensPorPagina = parseInt(request.query.itens) || 10;
    const { rows, count } = await Pessoa.findAndCountAll({
        offset: (pagina - 1) * itensPorPagina,
        limit: itensPorPagina,
    });
    response.status(200).json({
        pessoas: rows,
        totalDeItems: count,
        pagina,
        itensPorPagina,
    });
};

const getPessoa = async (request, response) => {
    const email = request.params.email
    let pessoa = await getPessoaFromCache(email)

    if (!pessoa) {
        pessoa = await Pessoa.findOne({ where: { email } })
        if (pessoa) {
            await setPessoaOnCache(pessoa)
            response.status(200).send(pessoa)
        } else {
            response.status(404).send("Pessoa não encontrada")
        }
    }
    else {
        response.status(200).send(pessoa)
    }
}

const addPessoa = async (request, response) => {
    const pessoa = Pessoa.build(request.body);
    pessoa.save().then(() => {
        response.status(201).send('Usuário criado!');
    }).catch(err => {
        response.status(400).send('Falha ao salvar');
    });

};

const deletarPessoa = async (request, response) => {
    const email = request.params.email;

    Pessoa.destroy({
        where: {
            email: email
        }
    }).then(result => {
        if (result > 0) {
            deletePessoaFromCache(email)
            response.status(200).send('Usuário removido');
        } else {
            response.status(404).send('Usuário não encontrado');
        }
    }).catch(err => {
        response.status(400).send('Falha ao remover');
    });

};

const atualizarPessoa = async (request, response) => {
    const { nome, email } = request.body

    Pessoa.findOne({ where: { email } }).then(pessoa => {
        if (pessoa) {
            pessoa.nome = nome
            setPessoaOnCache(pessoa)
            pessoa.update()
            response.status(200).send('Usuário atualizado');
        } else {
            response.status(404).send('Usuário não encontrado');
        }

    }).catch(err => {
        console.log(err);
        response.status(400).send('Falha ao atualizar');
    });

}

const getPessoaFromCache = async (email) => {
    try {
        const pessoa = await redisInstance.get(email)
        return JSON.parse(pessoa)
    }
    catch (err) {
        return null
    }
}

const deletePessoaFromCache = async (email) => {
    try {
        return await redisInstance.del(email)
    }
    catch (err) {
        console.error('Erro ao deletar pessoa do cache')
    }
}

const setPessoaOnCache = async (pessoa) => {
    try {
        return await redisInstance.set(pessoa.email, JSON.stringify(pessoa), { EX: 3600 })
    }
    catch (err) {
        console.error('Erro ao setar usuário em cache')
    }
}

module.exports = { getPessoas, getPessoa, addPessoa, deletarPessoa, atualizarPessoa };