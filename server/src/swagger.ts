import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GryHat API',
      version: '1.0.0',
      description: 'API documentation for GryHat'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./routes/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
