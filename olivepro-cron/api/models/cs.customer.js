'use strict'

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'cs_customer',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      subName: {
        type: DataTypes.STRING(50),
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        // unique: true,
        allowNull: false,
      },
      subPhoneNumber: {
        type: DataTypes.STRING(50),
      },
      email: {
        type: DataTypes.STRING(50),
      },
      customerInfo: {
        //  고객 특징
        type: DataTypes.TEXT,
      },
      usable: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
      },
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      tableName: 'cs_customer',
      timestamps: true,
      underscored: true, // true 시 테이블과 칼럼명을 카멜케이스로 바꾼다
      //indexes: [{ name: 'idx_reserve_date_time', unique: false, fields: [{ attribute: 'reserve_date_time', order: 'ASC' }] }],
    }
  )

  model.associate = models => {
    // 1  : N 관계  ( 고객   :    고객 상담    )
    model.hasMany(models.csConsult, { foreignKey: 'customer_id', sourceKey: 'id' })
    // 1  : N 관계  ( 고객   :    주문반품내역 )
    model.hasMany(models.csOrder, { foreignKey: 'customer_id', sourceKey: 'id' })
  }

  return model
}
