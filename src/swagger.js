// swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Soluxury API",
      version: "1.0.0",
      description: "Documentation de l’API Soluxury avec Swagger",
    },
    servers: [
      {
        url: "http://localhost:5000/api", // base URL de ton API
      },
    ],
  },
  apis: ["./routes/*.js"], // fichiers où tu vas mettre les commentaires JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
