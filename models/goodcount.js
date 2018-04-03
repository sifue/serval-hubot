'use strict';
const loader = require('./sequelizeLoader');
const Sequelize = loader.Sequelize;

const Goodcount = loader.database.define(
  'goodcounts',
  {
    userId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    realName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    displayName: {
      type: Sequelize.STRING,
      allowNull: true
    },
    goodcount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    freezeTableName: false,
    timestamps: true,
    indexes: [
      {
        fields: ['goodcount']
      }
    ]
  }
);

module.exports = Goodcount;
