const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
  },
  apis: [
    path.join(process.cwd(), 'src/config/swagger.schemas.ts'),
    path.join(process.cwd(), 'src/routes/*.ts'),
  ],
};

const spec = swaggerJSDoc(options);
console.log('Schemas found:', Object.keys(spec.components?.schemas || {}));
console.log('RegisterInput exists:', !!spec.components?.schemas?.RegisterInput);
console.log('LoginInput exists:', !!spec.components?.schemas?.LoginInput);
