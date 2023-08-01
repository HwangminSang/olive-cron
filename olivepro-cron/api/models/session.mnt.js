'use strict'

module.exports = (sequelize, DataTypes) => {
  const sessionMnt = sequelize.define('session_mnt',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sessionId: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      projectId: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      event: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      timestamp: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      connectionId: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      connectionAt: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      connectionData: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'session_mnt',
      timestamps: true,
    });
  // sessionMnt.hasMany()
  return sessionMnt;
};