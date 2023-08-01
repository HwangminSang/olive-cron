'use strict'

module.exports = (sequelize, DataTypes) => {
  const archiveMnt = sequelize.define('archive_mnt',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      archiveId: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      event: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      partnerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      resolution: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      sessionId: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'archive_mnt',
      timestamps: false,
    });
  // sessionMnt.hasMany()
  return archiveMnt;
};