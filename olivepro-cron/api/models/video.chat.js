'use strict'

module.exports = (sequelize, DataTypes) => {
    const videoChat = sequelize.define(
        'video_chat',
        {
            id: {
                type: DataTypes.INTEGER(11).UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            sessionId: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            // 세션 요청한 유저 uuid or email
            owner: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            // 올리브 기기 타입 se, pro, max 등
            oliveType: {
                type: DataTypes.TINYINT(1),
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            birthDate: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            gender: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            lang: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            leftMaster: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            leftLoud: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            leftMedium: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            leftSoft: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            leftCoordnateTable: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            rightMaster: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            rightLoud: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            rightMedium: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            rightSoft: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            rightCoordnateTable: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            count: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            comment: {
                type: DataTypes.TEXT,
                defaultValue: 'none',
            },
            // 1 = 세션 열림 2 = 대화 진행중 3 = 종료됨
            progressStatus: {
                type: DataTypes.TINYINT(1),
                allowNull: false,
            },
            sessionOpenAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('now'),
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
            tableName: 'video_chat',
            charset: 'utf8', // 한국어 설정
            collate: 'utf8_general_ci', // 한국어 설정
            timestamps: true,
            underscored: true, // true 시 테이블과 칼럼명을 underscored로 변환
        }
    )
    return videoChat
}
