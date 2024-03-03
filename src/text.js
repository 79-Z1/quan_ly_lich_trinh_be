const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Schedule Manager API',
            description: "API endpoints for a mini blog services documented on swagger",
            contact: {
                name: "Truong Khanh Hoa",
                email: "hoakt0129@gmail.com",
                url: "https://github.com/79-Z1"
            },
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3005/",
                description: "Local server"
            }
        ]
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                in: "header",
                name: "authorization",
                scheme: "bearer",
                bearerFormat: "JWT",
                value: "Bearer <JWT token here>",
            }
        }
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    // looks for configuration in specified directories
    apis: [`${__dirname}/routes/**/*.js`],
}

const swaggerSpec = swaggerJsdoc(options)
const swaggerUiOptions = {
    explorer: true
};

function swaggerDocs(app, port) {
    const PORT = process.env.PORT || 3052;
    // Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions))
    // Documentation in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec, swaggerUiOptions)
    })
}
module.exports = {
    swaggerDocs
}