const redis = require('redis')
const Pessoa = require('../models/pessoa');
require('dotenv').config();

const cache = redis.createClient(
    {url:`redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`}
    )

const getPessoas = async (request, response)=>{
    const pessoas = await Pessoa.findAll();
    response.status(200).send(pessoas);
};

const getPessoa = async (request, response)=>{
    const email = request.params.email
    let pessoa = await getPessoaFromCache(email)
    
    if(!pessoa){
        pessoa = await Pessoa.findOne({where:{email}})
        if(pessoa){
            await setPessoaOnCache(pessoa)
            response.status(200).send(pessoa)
        }else{
            response.status(404).send("Pessoa não encontrada")
        }
    }
    else{
        response.status(200).send(pessoa)
    }
}

const getPessoaFromCache = async (email) => {
    try{
        const pessoa = await cache.get(email)
        return JSON.parse(pessoa)
    }
    catch(err){
        return null
    }
}

const setPessoaOnCache = async (pessoa) => {
    return await cache.set(pessoa.email, JSON.stringify(pessoa), {EX: 3600})
}

const addPessoa = async (request, response) =>{
    const pessoa = Pessoa.build(request.body);
    pessoa.save().then(()=>{
        response.status(200).send('Usuário criado!');
    }).catch(err =>{
        response.status(400).send('Falha ao salvar');
    });

};

const deletarPessoa = async (request, response)=>{
    const email = request.params.email;

    Pessoa.destroy({
        where: {
            email: email
        }
    }).then(result=>{
        if(result>0){
            response.status(200).send('Usuário removido');
        }else{
            response.status(200).send('Usuário não encontrado');
        }
    }).catch(err=>{
        response.status(400).send('Falha ao remover');
    });

};

const atualizarPessoa = async(request, response)=>{
    
    Pessoa.update({
        nome: request.body.nome},
            {
                where: {
                    email: request.body.email
            }
        }
    ).then(result=>{
        if(result>0){
            response.status(200).send('Usuário atualizado');
        }else{
            response.status(200).send('Usuário não encontrado');
        }
    }).catch(err=>{
        console.log(err);
        response.status(400).send('Falha ao atualizar');
    });

}

const sincronizar = async(request, response) =>{
    await cache.connect()
    await Pessoa.sync()
    response.status(200).send('Sincronizado');
}

module.exports = {getPessoas, getPessoa, addPessoa, sincronizar, deletarPessoa, atualizarPessoa};