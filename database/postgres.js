require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

const database = new Sequelize(process.env.PG_DATABASE, process.env.PG_USERNAME, process.env.PG_PASSWORD, {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const sincronizarPostgres = async () => {
  try {
    await database.sync()
    return 'Postgres sincronizado'
  }
  catch (err) {
    return `Falha ao sincronizar postgres: ${err}`
  }
}

module.exports = { database, sincronizarPostgres };