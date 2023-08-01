'use strict';

module.exports = (sequelize, DataTypes) => {
  const Tutorial = sequelize.define('tutorial', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN(false),
      allowNull: false,
    },
    title2: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },

    // title: {
    //     type: DataTypes.STRING(256),
    //     allowNull: false,
    // },
    // description: {
    //     type: DataTypes.STRING(256),
    //     allowNull: false,
    // },
    // published: {
    //     type: DataTypes.BOOLEAN(false)
    // }
    // title: {
    //     type: Sequelize.STRING
    // },
    // description: {
    //     type: Sequelize.STRING
    // },
    // published: {
    //     type: Sequelize.BOOLEAN
    // }
  }, {
    tableName: 'tutorial',
    timestamps: true,
    // indexes: [
    //   {
    //     name: 'idx_push_roundNumber',
    //     unique: false,
    //     fields: [{
    //       attribute: 'roundNumber',
    //       order: 'DESC',
    //     }],
    //   },
    // ],
  });

  return Tutorial;
};