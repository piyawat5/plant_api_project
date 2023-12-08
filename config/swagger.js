const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Plant shop API",
      version: "1.0.0",
      description: "Plant shop API NodeJS web API",
      termsOfService: "https://github.com/piyawat5",
      contact: {
        name: "Piyawat Pintusornsri",
        url: "https://github.com/piyawat5",
      },
      license: {
        name: "Use under MIT",
        url: "https://github.com/piyawat5",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
