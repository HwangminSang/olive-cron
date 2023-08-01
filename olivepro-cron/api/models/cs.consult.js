'use strict'

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'cs_consult',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryMain: {
        //  대분류
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      categorySub: {
        //  중분류
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      consultNumber: {
        // 상담 접수 번호
        type: DataTypes.STRING(50),
      },
      consultDate: {
        //  상담 접수일
        type: DataTypes.DATE,
        // allowNull: false,
      },
      // consultTime: {    //  상담 접수시간
      //   type: DataTypes.STRING(10),
      //   allowNull: false,
      // },
      staff: {
        //  담당자
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: '이복희',
      },
      csStatus: {
        //  예약 : 1, 완료 : 2
        type: DataTypes.TINYINT(1),
      },
      reservedAt: {
        //  예약 시간
        type: DataTypes.DATE,
      },
      content: {
        // 상담 내역
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
      tableName: 'cs_consult',
      timestamps: true,
      underscored: true, // true 시 테이블과 칼럼명을 카멜케이스로 바꾼다
      //indexes: [{ name: 'idx_reserve_date_time', unique: false, fields: [{ attribute: 'reserve_date_time', order: 'ASC' }] }],
      indexes: [
        {
          name: 'idx_customerId_consultDate_content',
          unique: false,
          fields: [
            // { attribute: 'customer_id', order: 'ASC' },
            { attribute: 'consult_date', order: 'ASC' },
          ],
        },
      ],
    }
  )

  model.associate = models => {
    //  N  :  1 관계    foreignKey   ,  targetKey
    model.belongsTo(models.csCustomer, { foreignKey: 'customer_id', targetKey: 'id' })
  }
  return model
}
