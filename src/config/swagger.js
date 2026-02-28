import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Soluxury Dashboard Admin API',
      version: '1.0.0',
      description: 'API de gestion du dashboard administrateur Soluxury - NFTs, Packs, Slots et utilisateurs',
      contact: {
        name: 'Mouhsine Naghach',
        email: 'mouhsine@soluxury.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.soluxury.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur'
            },
            displayName: {
              type: 'string',
              description: 'Nom d\'affichage'
            },
            country: {
              type: 'string',
              description: 'Pays de résidence'
            },
            isBlock: {
              type: 'boolean',
              description: 'Statut de blocage de l\'utilisateur'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création du compte'
            },
            wallet: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Wallet'
              }
            }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID du wallet'
            },
            address: {
              type: 'string',
              description: 'Adresse du portefeuille crypto'
            },
            isPrimary: {
              type: 'boolean',
              description: 'Wallet principal ou non'
            }
          }
        },
        Pack: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID du pack'
            },
            name: {
              type: 'string',
              description: 'Nom du pack'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Description du pack'
            },
            price_usd: {
              type: 'number',
              format: 'decimal',
              description: 'Prix en USD'
            },
            price_eth: {
              type: 'string',
              description: 'Prix converti en ETH'
            },
            type: {
              type: 'string',
              enum: ['bronze', 'silver', 'gold'],
              description: 'Type de pack'
            },
            image_url: {
              type: 'string',
              nullable: true,
              description: 'URL de l\'image du pack'
            },
            is_active: {
              type: 'boolean',
              description: 'Pack actif ou non'
            }
          }
        },
        Slot: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID du slot'
            },
            name: {
              type: 'string',
              description: 'Nom du slot'
            },
            level: {
              type: 'integer',
              enum: [1, 2, 3],
              description: 'Niveau du slot (1, 2 ou 3)'
            },
            base_price_usd: {
              type: 'number',
              format: 'decimal',
              description: 'Prix de base en USD'
            },
            image_url: {
              type: 'string',
              nullable: true,
              description: 'URL de l\'image du slot'
            },
            is_active: {
              type: 'boolean',
              description: 'Slot actif ou non'
            },
            is_sellable: {
              type: 'boolean',
              description: 'Slot vendable ou non'
            }
          }
        },
        Admin: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID de l\'administrateur'
            },
            username: {
              type: 'string',
              description: 'Nom d\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            role: {
              type: 'string',
              enum: ['superadmin', 'admin', 'manager', 'viewer'],
              description: 'Rôle de l\'administrateur'
            },
            isActive: {
              type: 'boolean',
              description: 'Compte actif ou non'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Message d\'erreur'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Liste des erreurs de validation'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Message de succès'
            },
            data: {
              type: 'object',
              description: 'Données de la réponse'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'array',
              items: {}
            },
            total: {
              type: 'integer',
              description: 'Nombre total d\'éléments'
            },
            page: {
              type: 'integer',
              description: 'Page actuelle'
            },
            totalPages: {
              type: 'integer',
              description: 'Nombre total de pages'
            }
          }
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
    './src/router/*.js',
    './src/controller/*.js'
  ],
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };