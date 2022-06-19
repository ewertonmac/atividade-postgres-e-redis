const redis = require('redis')
require('dotenv').config();

const username = process.env.REDIS_USER
const password = process.env.REDIS_PASSWORD
const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT

const redisInstance = redis.createClient(
    {url:`redis://${username}:${password}@${host}:${port}`}
)

const conectRedis = async () => {
    try{
        await redisInstance.connect()
        return 'redis conectado'
    }
    catch(err){
        return `Falha ao conectar redis: ${err}`
    }
}



module.exports = {redisInstance, conectRedis}