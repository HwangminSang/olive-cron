'use strict'

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'cs_order',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      product: {
        //  제품명
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      productCount: {
        type: DataTypes.TINYINT(2),
        allowNull: false, //  false로 지정하면 값이 Null인 경우 값을 DB에 저장하지 않습니다.
      },
      productStatus: {
        type: DataTypes.ENUM('A', 'B', 'C'),
        defaultValue: 'A',
      },
      productColor: {
        type: DataTypes.STRING(10),
      },
      orderAt: {
        type: DataTypes.DATE,
      },
      shopName: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      serialNumber: {
        type: DataTypes.STRING(50),
      },
      monthlyFee: {
        // 월정액비
        type: DataTypes.STRING(50),
      },

      subscriptionFee: {
        // 가입비
        type: DataTypes.STRING(10),
      },
      address: {
        type: DataTypes.STRING(255),
      },
      delivery: {
        type: DataTypes.STRING(50),
      },
      deliveryCode: {
        type: DataTypes.STRING(50),
      },

      /**
       * 반품 정보
       * allowNull -> 기본 default null이 가능하도록 설정
       */
      returnType: {
        // 반품 ,  교환  , AS
        type: DataTypes.STRING(50),
      },
      returnReason: {
        // ( 색상 , 제품불량 , 충전불량 , 기능불량 , 부적응 , 볼륨부족 , 단순변심 , 파손 , 안심케어 , 기타 )
        type: DataTypes.STRING(50),
      },
      returnAt: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      returnSerialNumber: {
        type: DataTypes.STRING(50),
      },
      returnReserve: {
        // 회수,  비회수
        type: DataTypes.STRING(50),
      },
      returnUsed: {
        // false: 미사용  ( 0 ), true: 사용  ( 1 ),
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      asCost: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      deposit: {
        // 입금 여부 => false: 지불 완료 x    , true: 지불 완료 o,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      returnZipCode: {
        type: DataTypes.STRING(10),
      },
      returnAddress: {
        type: DataTypes.STRING(255),
      },
      returnDelivery: {
        type: DataTypes.STRING(50),
      },
      returnDeliveryCode: {
        type: DataTypes.STRING(50),
      },
      companyCost: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      userCost: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      otherAnswer: {
        // 기타 사항
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
      tableName: 'cs_order',
      timestamps: true,
      underscored: true, // true 시 테이블과 칼럼명을 카멜케이스로 바꾼다
      // indexes: [{ name: 'idx_reserve_date_time', unique: false, fields: [{ attribute: 'reserve_date_time', order: 'ASC' }] }],
      indexes: [
        {
          name: 'idx_customerId_product_serialNumber',
          unique: false,
          fields: [
            // { attribute: 'customer_id', order: 'ASC' },
            { attribute: 'product', order: 'ASC' },
            { attribute: 'serial_number', order: 'DESC' },
          ],
        },
      ],
    }
  )

  model.associate = models => {
    // N : 1 관계  foreignKey, targetKey
    model.belongsTo(models.csCustomer, { foreignKey: 'customer_id', targetKey: 'id' })
  }

  return model
}
