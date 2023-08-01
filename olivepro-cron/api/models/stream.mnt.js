'use strict'

module.exports = (sequelize, DataTypes) => {
  const streamMnt = sequelize.define('stream_mnt',
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
      streamId: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      streamAt: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      streamName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      streamType: {
        type: DataTypes.STRING(15),
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
      tableName: 'stream_mnt',
      timestamps: true,
    });
  // sessionMnt.hasMany()
  return streamMnt;
};