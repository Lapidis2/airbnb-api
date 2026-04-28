const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const options = {
  definition: { openapi: '3.0.0', info: { title: 'test', version: '1.0.0' } },
  apis: [path.join(process.cwd(), 'src/config/swagger.schemas.ts'), path.join(process.cwd(), 'src/routes/*.ts')]
};
console.log(JSON.stringify(options.apis));
