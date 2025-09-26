import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
<<<<<<< HEAD
=======
import configKeys from './config';

// Build base URL from env (protocol/host/port)
const PROTOCOL =
  (process.env.SWAGGER_SERVER_PROTOCOL || process.env.PROTOCOL || 'http')
    .replace(/:$/, '');
const HOST = process.env.SWAGGER_SERVER_HOST || process.env.HOST || 'localhost';
const PORT = Number(configKeys.PORT) || 5000;

// NOTE: servers[].url SHOULD be the API base, not the /api-docs path
const BASE_URL = `${PROTOCOL}://${HOST}:${PORT}`;
>>>>>>> 26dac1f2e6ce2264a5d4d96b061f7821bb2b29ba

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
<<<<<<< HEAD
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
=======
      title: 'GrayHat API',
      version: '1.0.0',
      description: 'API documentation for GrayHat - E-Learning Platform'
    },
    servers: [
      {
        url: BASE_URL, // e.g., http://localhost:5000
        description: 'Environment server (dynamic)'
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
    security: [{ bearerAuth: [] }]
  },
  apis: [
    './src/frameworks/webserver/routes/*.ts',
    './src/adapters/controllers/*.ts'
  ]
>>>>>>> 26dac1f2e6ce2264a5d4d96b061f7821bb2b29ba
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
