'use strict'

module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'cms_push',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      // 정보성 1 , 광고성 2
      type: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 1,
      },
      // ALL  , KR , JP , US
      country: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      os: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: 'android',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      urlLink: {
        type: DataTypes.STRING(255),
      },
      topic: {
        type: DataTypes.STRING(32),
      },
      // category: {
      //   type: DataTypes.STRING(32),
      // },
      // 전체, 토픽, 필터, 특정 사용자
      sendTo: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      // 발송 타입 (즉시, 예약)
      sendType: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      idList: {
        type: DataTypes.STRING(255),
      },
      filter: {
        type: DataTypes.STRING(255),
      },
      /**
       * 1: 예약, 2: 발송 중, 3. 발송 완료
       */
      reserveStatus: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      reserveDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      pushedDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      usable: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
      },
      author: {
        type: DataTypes.STRING(255),
        defaultValue: 'sys',
      },
      successCount: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      failCount: {
        type: DataTypes.INTEGER(11),
        defaultValue: 0,
      },
      cancelDateTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.fn('now'),
      },
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      tableName: 'cms_push',
      timestamps: false,
      underscored: true, // true 시 테이블과 칼럼명을 카멜케이스로 바꾼다
      indexes: [{ name: 'idx_reserve_date_time', unique: false, fields: [{ attribute: 'reserve_date_time', order: 'ASC' }] }],
    }
  )
  return model
}
