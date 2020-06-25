import * as fastify from 'fastify';
import * as fastifyBlipp from 'fastify-blipp';
import * as fSwagger from 'fastify-swagger';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import * as sourceMapSupport from 'source-map-support';
import * as fastifyJwt from 'fastify-jwt';

import db from './modules/db';

import authRoutes from './modules/routes/auth';
import statusRoutes from './modules/routes/status';
import userRoutes from './modules/routes/users';

const swaggerOptions = {
	routePrefix: '/documentation',
	exposeRoute: true,
	swagger: {
		info: {
			title: 'Soho learn backend api',
			description: 'Soho learn backend api',
			version: '1.0.0',
		},
		externalDocs: {
			url: 'https://swagger.io',
			description: 'Find more info here',
		},
		servers: [{ url: 'http://localhost:3000', description: 'local development' }],
		schemes: ['http'],
		consumes: ['application/json'],
		produces: ['application/json'],
	},
};
sourceMapSupport.install();

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
	logger: true,
	ajv: {
		customOptions: { allErrors: true, jsonPointers: true },
		plugins: [require('ajv-errors')],
	},
});

server.register(fastifyBlipp);
server.register(fSwagger, swaggerOptions);
server.register(db, { uri: 'mongodb://localhost:27017/soho', useUnifiedTopology: true });

const jwtErrorMessages = {
	badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
	noAuthorizationInHeaderMessage: 'Autorization header is missing!',
	authorizationTokenExpiredMessage: 'Authorization token expired',
	// for the below message you can pass a sync function that must return a string as shown or a string
	authorizationTokenInvalid: err => {
		return `Authorization token is invalid: ${err.message}`;
	},
};

server.register(fastifyJwt, {
	secret: 'super-secret',
	messages: jwtErrorMessages,
});

server.decorate('authenticate', async function (request, reply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.code(403).send([{ message: err.message }]);
	}
});

server.register(statusRoutes);
server.register(userRoutes);
server.register(authRoutes);

server.setErrorHandler(function (error, request, reply) {
	if (error.validation) {
		reply.status(400).send(
			error.validation.map(vError => {
				return { message: vError.message };
			}),
		);
		return;
	}
	reply.send(error);
});

const start = async () => {
	try {
		await server.listen(3000, '0.0.0.0');

		const address = server.server.address() as AddressInfo;

		server.blipp();
		server.swagger();
		server.log.info(`Server running on http://${address.address}:${address.port}`);
	} catch (err) {
		console.log(err);
		server.log.error(err);
		process.exit(1);
	}
};

process.on('uncaughtException', error => {
	console.error(error);
});
process.on('unhandledRejection', error => {
	console.error(error);
});

start();
