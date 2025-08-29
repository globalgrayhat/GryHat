import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GryHat API',
      version: '1.0.0',
      description: 'API documentation for GryHat - E-Learning Platform'
    },
    servers: [
      {
        url: 'http://localhost:5000', // ← غيّر هذا إذا كانت البورت مختلفة
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/frameworks/webserver/routes/*.ts',
    './src/adapters/controllers/*.ts' 
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
