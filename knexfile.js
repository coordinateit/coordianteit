module.exports = {

  development: {
    client: 'postgres',
    connection: 'postgres://localhost:5432/coordinateit'
  },
  staging: {
    client: 'postgres',
    connection: process.env.DATABASE_URL
  },
  production: {
    client: 'postgres',
    connection: process.env.DATABASE_URL
  }

};
