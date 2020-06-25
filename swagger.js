exports.options = {
    routePrefix: '/documentation',
    exposeRoute: true,
    swagger: {
      info: {
        title: 'Helf Webrtc backend api',
        description: 'Helf Webrtc backend api',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      servers: [
        { url: `http://localhost:3000`, description: 'local development' },
      ],
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  }