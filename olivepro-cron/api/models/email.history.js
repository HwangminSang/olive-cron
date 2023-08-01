'use strict'

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'email_history',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      // send_type: {
      //   type: DataTypes.TINYINT(1),
      //   defaultValue: 0,
      // },
      sender: {
        type: DataTypes.STRING(32),
        defaultValue: 'olive union',
      },
      group: {
        type: DataTypes.STRING(32),
        defaultValue: 'none',
      },
      // title: {
      //   type: DataTypes.STRING(256),
      //   allowNull: false,
      // },
      send_to: {
        type: DataTypes.TEXT,
        defaultValue: 'none',
      },
      success: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      sub_title: {
        type: DataTypes.STRING(256),
        defaultValue: 'none',
      },
      body: {
        type: DataTypes.TEXT,
        defaultValue: 'none',
      },
      template_data: {
        type: DataTypes.TEXT,
        defaultValue: 'none',
      },
      used_template: {
        type: DataTypes.STRING(32),
        defaultValue: 'none',
      },
      // url_link: {
      //   type: DataTypes.STRING(256),
      //   allowNull: false,
      // },
      // filter: {
      //   type: DataTypes.STRING(100),
      //   defaultValue: 'none',
      // },
      // reserve_date_time: {
      //   type: DataTypes.DATE,
      //   allowNull: false,
      //   defaultValue: sequelize.fn('now'),
      // },
      sent_date_time: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      /**
       * 1: 예약, 2: 발송 중, 3. 발송 완료
       */
      // reserve_status: {
      //   type: DataTypes.TINYINT(1),
      //   defaultValue: 0,
      // },
      // usable: {
      //   type: DataTypes.TINYINT(1),
      //   defaultValue: 1,
      // },
      // author: {
      //   type: DataTypes.STRING(32),
      //   defaultValue: 'sys',
      // },
      error_data: {
        type: DataTypes.TEXT,
        defaultValue: 'none',
      },
      response_data: {
        type: DataTypes.TEXT,
        defaultValue: 'none',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
    },
    {
      tableName: 'email_history',
      timestamps: false,
      indexes: [{ name: 'idx_sent_date_time', unique: false, fields: [{ attribute: 'sent_date_time', order: 'ASC' }] }],
    }
  )
  return model
}
