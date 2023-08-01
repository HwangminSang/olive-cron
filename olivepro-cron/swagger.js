const swaggerUi = require('swagger-ui-express')

const swaggereJsdoc = require('swagger-jsdoc')

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Cron Olive API Documentation',
      version: '1.0.0',
      description: 'Cron Olive API dev 연동 문서입니다.',
    },
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          in: 'header',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        jwt: [],
      },
    ],
  },
  apis: ['./dist/api/routes/*.js', './dist/api/swagger/*'],
}

const specs = swaggereJsdoc(options)

module.exports = { swaggerUi, specs }
