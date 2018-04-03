'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost/serval_hubot',
  { logging: !(process.env.NODE_ENV === 'production') }
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};
